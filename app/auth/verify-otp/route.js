import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { verifyOtpCode } from '../../../../lib/afromessage'
import { createServerClient } from '../../../../lib/supabase'

export async function POST(request) {
  const { phone, code, name } = await request.json()
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
    .select('id')
    .eq('phone', phone)
    .maybeSingle()

  let userId = existingProfile?.id

  if (!userId) {
    // New user
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      phone,
      password: tempPassword,
      phone_confirm: true,
      user_metadata: { full_name: name || null, phone },
    })
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
    userId = created.user.id

    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      phone,
      phone_verified: true,
      full_name: name || null,
    })
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
