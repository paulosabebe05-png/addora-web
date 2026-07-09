const AFRO_BASE = 'https://api.afromessage.com/api'

// Normalizes Ethiopian numbers: 0912345678 -> +251912345678
export function normalizePhone(input) {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('251')) return `+${digits}`
  if (digits.startsWith('0'))   return `+251${digits.slice(1)}`
  if (digits.startsWith('9') || digits.startsWith('7')) return `+251${digits}`
  return `+${digits}`
}

export async function sendOtp(phone) {
  const res = await fetch(`${AFRO_BASE}/challenge`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AFROMESSAGE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.AFROMESSAGE_IDENTIFIER_ID,
      sender: process.env.AFROMESSAGE_SENDER_NAME,
      to: phone,
      pr: 'Your Addora code is',
      ps: 'Valid for 5 minutes',
      len: 6,
      t: 0,
      ttl: 300,
    }),
  })
  const data = await res.json()
  if (data.acknowledge !== 'success') {
    throw new Error(data.response?.errors?.[0] || 'Failed to send code')
  }
  return data
}

export async function verifyOtpCode(phone, code) {
  const res = await fetch(`${AFRO_BASE}/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AFROMESSAGE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to: phone, code }),
  })
  const data = await res.json()
  return data.acknowledge === 'success'
}