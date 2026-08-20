const SMS_BASE = 'https://smsethiopia.com/api'

// Normalizes Ethiopian numbers for SMSEthiopia, which wants 251XXXXXXXXX
// (12 digits, no leading '+'). Matches their docs example: "251912345123".
export function normalizePhone(input) {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('251')) return digits
  if (digits.startsWith('0'))   return `251${digits.slice(1)}`
  if (digits.startsWith('9') || digits.startsWith('7')) return `251${digits}`
  return digits
}

// Same normalized number but in +251... form, for display and for
// anything downstream (Supabase auth, UI) that still expects a '+'.
export function toDisplayPhone(normalized) {
  return `+${normalized}`
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// SMSEthiopia is a plain "send SMS" API — no built-in OTP challenge/verify
// pair like AfroMessage had. We generate + store the code ourselves
// (see otp.js) and just use this to deliver the text.
//
// Using API v2: same auth/request body as v1, but returns a real
// trackable message ID + status instead of v1's always-0 id.
// Confirmed from SMSEthiopia's own v1→v2 migration table:
//   - Auth header: "KEY" (alias "api_key" also accepted)
//   - Request body: { msisdn, text, messageType? }
export async function sendSms(msisdn, text) {
  const res = await fetch(`${SMS_BASE}/v2/sms/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'KEY': process.env.SMSETHIOPIA_API_KEY,
    },
    body: JSON.stringify({ msisdn, text }),
  })

  const data = await res.json()
  if (!data.sent) {
    throw new Error(data.messageClass || data.description || 'Failed to send SMS')
  }
  return data // { sent, id, segments, status }
}

export async function sendOtpSms(msisdn, code) {
  const text = `Your Addora code is ${code}. Valid for 5 minutes.`
  return sendSms(msisdn, text)
}

// Optional: look up delivery status for a message sent via v2, using the
// id returned from sendSms(). Not required for the OTP flow itself.
export async function getMessageStatus(id) {
  const res = await fetch(`${SMS_BASE}/v2/sms/${id}`, {
    method: 'GET',
    headers: {
      'KEY': process.env.SMSETHIOPIA_API_KEY,
    },
  })
  return res.json()
}