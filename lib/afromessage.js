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
  const params = new URLSearchParams({
    from: process.env.AFROMESSAGE_IDENTIFIER_ID,
    sender: process.env.AFROMESSAGE_SENDER_NAME,
    to: phone,
    pr: 'Your Addora code is',
    ps: 'Valid for 5 minutes',
    len: '6',
    t: '0',
    ttl: '300',
  })

  const res = await fetch(`${AFRO_BASE}/challenge?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.AFROMESSAGE_TOKEN}`,
    },
  })
  const data = await res.json()
  if (data.acknowledge !== 'success') {
    throw new Error(data.response?.errors?.[0] || 'Failed to send code')
  }
  return data
}

export async function verifyOtpCode(phone, code) {
  const params = new URLSearchParams({ to: phone, code })

  const res = await fetch(`${AFRO_BASE}/verify?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.AFROMESSAGE_TOKEN}`,
    },
  })
  const data = await res.json()
  return data.acknowledge === 'success'
}
