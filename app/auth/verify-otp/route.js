import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { verifyOtp } from '../../../lib/otp'
import { createServerClient } from '../../../lib/supabase'

// Supabase Admin API has no getUserByPhone, so we page through listUsers.
// Fine at small/medium scale; if the user base grows large, replace this
// with a Postgres function (e.g. a SECURITY DEFINER RPC that queries
// auth.users directly) for O(1) lookup instead of paging.
async function findAuthUserByPhone(supabaseAdmin, phone) {
  const normalizedTarget = phone.replace(/\D/g, '')
  let page = 1
  const perPage = 200

  while (page <= 25) { // hard cap ~5000 users scanned, avoid runaway loops
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error || !data?.users?.length) break

    const match = data.users.find(u => (u.phone || '').replace(/\D/g, '') === normalizedTarget)
    if (match) return match

    if (data.users.length < perPage) break // last page
    page += 1
  }
  return null
}

export async function POST(request) {
  const { phone, code, name, mode } = await request.json()
  if (!phone || !code) {
    return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 })
  }

  const supabaseAdmin = createServerClient()

  // Code check is now fully app-side (see lib/otp.js) since SMSEthiopia
  // only sends texts — it has no verify endpoint of its own.
  const ok = await verifyOtp(supabaseAdmin, phone, code)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  const tempPassword = randomBytes(24).toString('hex')

  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, phone_verified')
    .eq('phone', phone)
    .maybeSingle()

  // Sign-in flow: no account for this number yet — don't auto-create one.
  if (mode === 'signin' && !existingProfile) {
    return NextResponse.json(
      { error: 'No account found for this number. Please sign up first.' },
      { status: 404 }
    )
  }

  // Sign-up flow: account already exists — don't create a duplicate.
  if (mode === 'signup' && existingProfile?.phone_verified) {
    return NextResponse.json(
      { error: 'An account with this number already exists. Please sign in instead.' },
      { status: 409 }
    )
  }

  let userId = existingProfile?.id

  if (!userId) {
    // New user
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      phone,
      password: tempPassword,
      phone_confirm: true,
      user_metadata: { full_name: name || null, phone },
    })

    if (createErr) {
      // This phone is still attached to an orphaned auth.users record —
      // e.g. someone deleted the `profiles` row but not the actual auth
      // user, so Supabase Auth still thinks the phone is taken even
      // though our own app has no account for it. Recover instead of
      // failing: find that orphaned auth user and reuse/repair it.
      const isDupePhone = /already.*registered|already.*exists|duplicate/i.test(createErr.message || '')
      if (!isDupePhone) {
        return NextResponse.json({ error: createErr.message }, { status: 500 })
      }

      const orphan = await findAuthUserByPhone(supabaseAdmin, phone)
      if (!orphan) {
        // Genuinely stuck — surface a clearer error than the raw Auth message.
        return NextResponse.json(
          { error: 'This phone number is already registered but the account could not be recovered. Please contact support.' },
          { status: 409 }
        )
      }

      userId = orphan.id

      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
        phone_confirm: true,
        user_metadata: { full_name: name || null, phone },
      })
      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      // Rebuild the missing profile row.
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        phone,
        phone_verified: true,
        full_name: name || null,
      })
    } else {
      userId = created.user.id

      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        phone,
        phone_verified: true,
        full_name: name || null,
      })
    }
  } else {
    // Existing user — rotate password so we can sign in server-side
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: tempPassword,
    })
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    const profileUpdate = { phone_verified: true }
    if (name) profileUpdate.full_name = name

    await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', userId)
  }

  const { data: signInData, error: signInErr } = await supabaseAdmin.auth.signInWithPassword({
    phone,
    password: tempPassword,
  })
  if (signInErr) return NextResponse.json({ error: signInErr.message }, { status: 500 })

  return NextResponse.json({
    access_token: signInData.session.access_token,
    refresh_token: signInData.session.refresh_token,
  })
}
