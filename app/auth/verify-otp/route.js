import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { verifyOtpCode } from '../../../lib/afromessage'
import { createServerClient } from '../../../lib/supabase'

export async function POST(request) {
  const { phone, code, name, mode } = await request.json()
  if (!phone || !code) {
    return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 })
  }

  const ok = await verifyOtpCode(phone, code)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  const supabaseAdmin = createServerClient()
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
      // Most likely cause: the profiles row for this phone was deleted
      // directly (e.g. from the DB/admin panel) without deleting the
      // matching auth.users row first. The FK only cascades that way
      // (auth.users delete -> profiles delete), never the reverse, so
      // the phone number is still "taken" in auth.users even though
      // there's no profile for it anymore. Recover by finding that
      // orphaned account and re-attaching a profile to it, instead of
      // permanently failing.
      const phoneTaken = /already.*registered|already.*exists|duplicate/i.test(createErr.message)
      if (!phoneTaken) {
        return NextResponse.json({ error: createErr.message }, { status: 500 })
      }

      const bareDigits = phone.replace(/^\+/, '')
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 })

      const orphan = list.users.find(u => u.phone === bareDigits || u.phone === phone)
      if (!orphan) {
        return NextResponse.json(
          { error: 'This number is registered but the account could not be recovered. Please contact support.' },
          { status: 500 }
        )
      }

      userId = orphan.id
      const { error: recoverErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
        phone_confirm: true,
      })
      if (recoverErr) return NextResponse.json({ error: recoverErr.message }, { status: 500 })

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
    // Existing user — rotate password so we can sign in server-side.
    // Also sync full_name into user_metadata if provided, so it never
    // drifts out of sync with the profiles table.
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: tempPassword,
      ...(name ? { user_metadata: { full_name: name, phone } } : {}),
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
