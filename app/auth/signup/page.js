'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth'
import styles from '../auth.module.css'

export default function SignUpPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
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
    setLoading(true)
    try {
      const data = await signUp({ name: form.name, email: form.email, password: form.password })
      // Supabase sends a confirmation email by default.
      // If email confirmation is disabled in your project, user is logged in immediately.
      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists')
      } else if (data?.session) {
        // Auto-confirmed (email confirmation disabled) → go to home
        router.push('/')
      } else {
        // Email confirmation required
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  if (success) return (
    <div className={styles.page}>
      <div className={styles.card}>
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

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M8 24 Q16 8 24 24" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <circle cx="8"  cy="24" r="2.8" fill="white"/>
              <circle cx="16" cy="13" r="2.8" fill="white"/>
              <circle cx="24" cy="24" r="2.8" fill="white"/>
            </svg>
          </div>
          <span>Addora</span>
        </div>

        <div className={styles.header}>
          <h1>Create account</h1>
          <p>Join Addora and start shopping today</p>
        </div>

        {/* Google button */}
        <button className={styles.googleBtn} onClick={handleGoogle} disabled={googleLoading} type="button">
          {googleLoading ? (
            <span className={styles.spinner} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? 'Connecting…' : 'Continue with Google'}
        </button>

        <div className={styles.orDivider}>
          <span /><p>or create with email</p><span />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>
            <div className={styles.inputWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" placeholder="Your full name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={styles.input} autoComplete="name" />
            </div>
          </div>

          <div className={styles.field}>
            <label>Email Address</label>
            <div className={styles.inputWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={styles.input} autoComplete="email" />
            </div>
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={styles.input} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(!showPass)} className={styles.eye}>
                {showPass
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label>Confirm Password</label>
            <div className={styles.inputWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input type="password" placeholder="Repeat your password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                className={styles.input} autoComplete="new-password" />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link href="/auth/signin">Sign in</Link>
        </p>
      </div>
    </div>
  )
}