import { NextResponse } from 'next/server'
import { sendOtp, normalizePhone } from '../../../../lib/afromessage'

export async function POST(request) {
  const { phone } = await request.json()
  if (!phone) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  const normalized = normalizePhone(phone)
  if (!/^\+251[79]\d{8}$/.test(normalized)) {
    return NextResponse.json({ error: 'Enter a valid Ethiopian phone number' }, { status: 400 })
  }

  try {
    await sendOtp(normalized)
    return NextResponse.json({ success: true, phone: normalized })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}