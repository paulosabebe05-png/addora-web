import { NextResponse } from 'next/server'
import { normalizePhone, toDisplayPhone, generateOtpCode, sendOtpSms } from '../../../lib/smsethiopia'
import { storeOtp } from '../../../lib/otp'
import { createServerClient } from '../../../lib/supabase'

export async function POST(request) {
  const { phone, mode } = await request.json()
  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  // SMSEthiopia wants "251XXXXXXXXX" (no '+'); we still validate/display
  // with a '+' prefix everywhere else in the app.
  const normalized = normalizePhone(phone)
  if (!/^251[79]\d{8}$/.test(normalized)) {
    return NextResponse.json({ error: 'Enter a valid Ethiopian phone number' }, { status: 400 })
  }
  const displayPhone = toDisplayPhone(normalized)

  // Look the number up BEFORE sending any SMS — no point texting a code
  // to a number that can't succeed either way.
  const supabaseAdmin = createServerClient()
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id, phone_verified')
    .eq('phone', displayPhone)
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
    const code = generateOtpCode()
    await storeOtp(supabaseAdmin, displayPhone, code)
    await sendOtpSms(normalized, code)
    return NextResponse.json({ success: true, phone: displayPhone })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
