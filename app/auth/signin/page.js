'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../lib/auth'
import styles from '../auth.module.css'

function SignInContent() {
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill in all fields'); return
    }
    setLoading(true)
    try {
      await signIn({ email: form.email, password: form.password })
      router.push(redirect)
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Incorrect email or password'
        : err.message)
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
          <h1>Welcome back</h1>
          <p>Sign in to your Addora account</p>
        </div>
        <button className={styles.googleBtn} onClick={handleGoogle} disabled={googleLoading} type="button">
          {googleLoading ? <span className={styles.spinner} /> : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? 'Connecting…' : 'Continue with Google'}
        </button>
        <div className={styles.orDivider}><span /><p>or sign in with email</p><span /></div>
        <form onSubmit={handleSubmit} className={styles.form}>
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
              <input type={showPass ? 'text' : 'password'} placeholder="Your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className={styles.input} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass(!showPass)} className={styles.eye}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Sign In'}
          </button>
        </form>
        <p className={styles.switchLink}>Don't have an account? <Link href="/auth/signup">Create one</Link></p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  )
}
