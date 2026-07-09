'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth'
import styles from '../auth.module.css'

function Logo() {
  return (
    <div className={styles.logoCenter}>
      <div className={styles.logoMark}>
        <img
          src="/logo.png"
          alt="Addora logo"
          className={styles.logoImg}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling.style.display = 'flex'
          }}
        />
        <span className={styles.logoFallback} style={{ display: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M8 24 Q16 8 24 24" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            <circle cx="8"  cy="24" r="2.8" fill="white"/>
            <circle cx="16" cy="13" r="2.8" fill="white"/>
            <circle cx="24" cy="24" r="2.8" fill="white"/>
          </svg>
        </span>
      </div>
      <span className={styles.logoWordmark}>Addora</span>
    </div>
  )
}

function AgreeCheckbox({ agreed, setAgreed, agreeError, setAgreeError }) {
  return (
    <>
      <label className={`${styles.agreeRow} ${agreeError ? styles.agreeRowError : ''}`}>
        <span
          className={`${styles.checkbox} ${agreed ? styles.checkboxChecked : ''}`}
          onClick={() => { setAgreed(!agreed); setAgreeError(false) }}
          role="checkbox"
          aria-checked={agreed}
          tabIndex={0}
          onKeyDown={e => e.key === ' ' && (setAgreed(!agreed), setAgreeError(false))}
        >
          {agreed && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
        <span className={styles.agreeText}>
          I agree to Addora's{' '}
          <Link href="/terms" className={styles.agreeLink}>Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className={styles.agreeLink}>Privacy Policy</Link>
        </span>
      </label>
      {agreeError && (
        <p className={styles.agreeErrorMsg}>
          Please accept the Terms &amp; Privacy Policy to continue.
        </p>
      )}
    </>
  )
}

function GoogleButton({ onClick, loading }) {
  return (
    <button className={styles.googleBtn} onClick={onClick} disabled={loading} type="button">
      {loading ? <span className={styles.spinner} /> : (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      {loading ? 'Connecting…' : 'Continue with Google'}
    </button>
  )
}

function OtpInput({ value, onChange }) {
  const refs = useRef([])

  const handleChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = value.split('')
    next[i] = digit
    onChange(next.join('').slice(0, 6))
    if (digit && refs.current[i + 1]) refs.current[i + 1].focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && refs.current[i - 1]) {
      refs.current[i - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const last = Math.min(pasted.length, 5)
    refs.current[last]?.focus()
  }

  return (
    <div className={styles.otpRow} onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          className={styles.otpBox}
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
        />
      ))}
    </div>
  )
}

export default function SignUpPage() {
  const { signUp, signInWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState('email') // 'email' | 'phone'
  const [phoneStep, setPhoneStep] = useState('enter') // 'enter' | 'verify'

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [phoneForm, setPhoneForm] = useState({ name: '', phone: '' })
  const [otp, setOtp] = useState('')
  const [resendSeconds, setResendSeconds] = useState(0)

  const [agreed, setAgreed] = useState(false)
  const [agreeError, setAgreeError] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const startResendTimer = () => {
    setResendSeconds(60)
    const interval = setInterval(() => {
      setResendSeconds(s => {
        if (s <= 1) { clearInterval(interval); return 0 }
        return s - 1
      })
    }, 1000)
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match'); return
    }
    if (!agreed) { setAgreeError(true); return }
    setAgreeError(false)
    setLoading(true)
    try {
      const data = await signUp({ name: form.name, email: form.email, password: form.password })
      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists')
      } else if (data?.session) {
        router.push('/')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setError('')
    if (!agreed) { setAgreeError(true); return }
    setAgreeError(false)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    if (!phoneForm.name) {
      setError('Please enter your full name'); return
    }
    if (!agreed) { setAgreeError(true); return }
    setAgreeError(false)
    if (!phoneForm.phone || phoneForm.phone.replace(/\D/g, '').length < 9) {
      setError('Enter a valid phone number'); return
    }
    setLoading(true)
    try {
      const { phone: normalized } = await sendPhoneOtp(phoneForm.phone)
      setPhoneForm({ ...phoneForm, phone: normalized })
      setPhoneStep('verify')
      startResendTimer()
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit code'); return
    }
    setLoading(true)
    try {
      await verifyPhoneOtp(phoneForm.phone, otp, phoneForm.name)
      router.push('/')
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendSeconds > 0) return
    setError('')
    try {
      await sendPhoneOtp(phoneForm.phone)
      startResendTimer()
    } catch (err) {
      setError(err.message)
    }
  }

  /* ── EMAIL SUCCESS STATE ── */
  if (success) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo />
        <div className={styles.successBox}>
          <div className={styles.successIcon}>✉️</div>
          <h2>Check your email!</h2>
          <p>
            We sent a confirmation link to <strong>{form.email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <Link href="/auth/signin" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  )

  /* ── OTP VERIFY STEP ── */
  if (tab === 'phone' && phoneStep === 'verify') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <Logo />
          <button className={styles.backBtn} onClick={() => { setPhoneStep('enter'); setOtp(''); setError('') }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Change number
          </button>

          <div className={styles.otpHeader}>
            <h1>Enter verification code</h1>
            <p>We sent a 6-digit code to<br /><strong>{phoneForm.phone}</strong></p>
          </div>

          <form onSubmit={handleVerifyCode} className={styles.form}>
            <OtpInput value={otp} onChange={setOtp} />

            <div className={styles.resendRow}>
              {resendSeconds > 0
                ? <span>Resend code in {resendSeconds}s</span>
                : <>Didn't get it?{' '}
                    <button type="button" className={styles.resendLink} onClick={handleResend}>
                      Resend code
                    </button>
                  </>
              }
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading || otp.length !== 6}>
              {loading ? <span className={styles.spinner} /> : 'Verify & Create Account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  /* ── MAIN SIGN UP CARD ── */
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo />

        <div className={styles.header}>
          <h1>Create account</h1>
          <p>Join Addora and start shopping today</p>
        </div>

        <GoogleButton onClick={handleGoogle} loading={googleLoading} />

        <div className={styles.orDivider}><span /><p>or continue with</p><span /></div>

        <div className={styles.tabRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === 'email' ? styles.tabBtnActive : ''}`}
            onClick={() => { setTab('email'); setError('') }}
          >
            Email
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === 'phone' ? styles.tabBtnActive : ''}`}
            onClick={() => { setTab('phone'); setError('') }}
          >
            Phone
          </button>
        </div>

        {tab === 'email' ? (
          <form onSubmit={handleEmailSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Full Name</label>
              <div className={styles.inputWrap}>
                <input type="text" placeholder="Your full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={styles.input} autoComplete="name" />
              </div>
            </div>

            <div className={styles.field}>
              <label>Email Address</label>
              <div className={styles.inputWrap}>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={styles.input} autoComplete="email" />
              </div>
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={styles.input} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className={styles.eye}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label>Confirm Password</label>
              <div className={styles.inputWrap}>
                <input type="password" placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  className={styles.input} autoComplete="new-password" />
              </div>
            </div>

            <AgreeCheckbox agreed={agreed} setAgreed={setAgreed} agreeError={agreeError} setAgreeError={setAgreeError} />

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Create Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendCode} className={styles.form}>
            <div className={styles.field}>
              <label>Full Name</label>
              <div className={styles.inputWrap}>
                <input type="text" placeholder="Your full name" value={phoneForm.name}
                  onChange={e => setPhoneForm({ ...phoneForm, name: e.target.value })}
                  className={styles.input} autoComplete="name" />
              </div>
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              <div className={styles.phoneInputWrap}>
                <span className={styles.phonePrefix}>+251</span>
                <input
                  type="tel"
                  placeholder="9XX XXX XXX"
                  value={phoneForm.phone}
                  onChange={e => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                  className={styles.phoneInput}
                  autoComplete="tel"
                />
              </div>
              <p className={styles.helperText}>We'll text you a 6-digit code to verify</p>
            </div>

            <AgreeCheckbox agreed={agreed} setAgreed={setAgreed} agreeError={agreeError} setAgreeError={setAgreeError} />

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Send Code'}
            </button>
          </form>
        )}

        <p className={styles.switchLink}>
          Already have an account? <Link href="/auth/signin">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
