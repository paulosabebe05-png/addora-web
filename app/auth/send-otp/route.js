import { NextResponse } from 'next/server'
import { sendOtp, normalizePhone } from '../../../lib/afromessage'
import { createServerClient } from '../../../lib/supabase'

export async function POST(request) {
  const { phone, mode } = await request.json()
  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  const normalized = normalizePhone(phone)
  if (!/^\+251[79]\d{8}$/.test(normalized)) {
    return NextResponse.json({ error: 'Enter a valid Ethiopian phone number' }, { status: 400 })
  }

  // Look the number up BEFORE sending any SMS — no point texting a code
  // to a number that can't succeed either way.
  const supabaseAdmin = createServerClient()
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, phone_verified')
    .eq('phone', normalized)
    .maybeSingle()

  if (mode === 'signin' && !existingProfile?.phone_verified) {
    return NextResponse.json(
      { error: 'No account found for this number. Please sign up first.' },
      { status: 404 }
    )
  }

  if (mode === 'signup' && existingProfile?.phone_verified) {
    return NextResponse.json(
      { error: 'An account with this number already exists. Please sign in instead.' },
      { status: 409 }
    )
  }

  try {
    await sendOtp(normalized)
    return NextResponse.json({ success: true, phone: normalized })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
