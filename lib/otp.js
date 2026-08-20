import { sendOtpSms, generateOtpCode } from './smsethiopia'

export const OTP_TTL_SECONDS = 300 // 5 minutes
export const MAX_ATTEMPTS = 5      // wrong-code guesses allowed before the code is invalidated

// Persists a code that's already been generated elsewhere (e.g.
// send-otp/route.js calling generateOtpCode() itself, then this to store
// it, then sendOtpSms() separately to deliver it).
export async function storeOtp(supabaseAdmin, phone, code) {
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString()

  const { error } = await supabaseAdmin
    .from('otp_verifications')
    .upsert({
      phone,
      code,
      attempts: 0,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[otp] failed to store verification code:', error)
    throw new Error('Failed to send verification code')
  }
}

// All-in-one convenience wrapper: generates a code, sends it via
// SMSEthiopia, and stores it. Not currently called by send-otp/route.js
// (which orchestrates the three steps itself via generateOtpCode +
// storeOtp + sendOtpSms) — kept in case other callers use it.
export async function sendOtp(supabaseAdmin, phone) {
  const code = generateOtpCode()
  await sendOtpSms(phone, code)
  await storeOtp(supabaseAdmin, phone, code)
}

export async function verifyOtp(supabaseAdmin, phone, submittedCode) {
  const { data: record } = await supabaseAdmin
    .from('otp_verifications')
    .select('code, attempts, expires_at')
    .eq('phone', phone)
    .maybeSingle()

  if (!record) return false

  if (new Date(record.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from('otp_verifications').delete().eq('phone', phone)
    return false
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await supabaseAdmin.from('otp_verifications').delete().eq('phone', phone)
    return false
  }

  if (record.code !== submittedCode) {
    await supabaseAdmin
      .from('otp_verifications')
      .update({ attempts: record.attempts + 1 })
      .eq('phone', phone)
    return false
  }

  // Correct code - clean up so it can't be reused.
  await supabaseAdmin.from('otp_verifications').delete().eq('phone', phone)
  return true
}
