import { useEffect, useState } from 'react'
import { Leaf, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from './AuthContext'
import './LoginPage.css'

export function LoginPage() {
  const { signInWithGoogle, signInAsGuest } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [motionPaused, setMotionPaused] = useState(() => document.hidden)
  useEffect(() => {
    const updateVisibility = () => setMotionPaused(document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])


  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please try again.'
      // Don't show error for user-cancelled popups
      if (message.includes('popup-closed-by-user') || message.includes('cancelled-popup-request')) {
        setLoading(false)
        return
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Decorative garden breeze; motion pauses when the page is hidden. */}
      <div className="login-bg" aria-hidden="true" data-paused={motionPaused}>
        <span className="login-floating-leaf" />
        <span className="login-floating-leaf leaf-two" />
        <span className="login-floating-leaf leaf-three" />
        <div className="login-gradient login-gradient-1" />
        <div className="login-gradient login-gradient-2" />
        <div className="login-gradient login-gradient-3" />
        <div className="login-orbs">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`login-orb orb-${i}`} />
          ))}
        </div>
      </div>

      {/* Sign-in card */}
      <div className="login-card">
        <div className="login-card-inner">
          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <Leaf size={28} />
            </div>
            <h1>
              re<span className="login-colon">:</span>source
              <span className="login-dot">®</span>
            </h1>
          </div>

          {/* Welcome text */}
          <div className="login-welcome">
            <h2>Welcome back</h2>
            <p>
              Sign in to discover reusable materials, plan your next build, and
              connect with your local maker community.
            </p>
          </div>

          {/* Google sign-in button */}
          <Button
            className="login-google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="login-spinner" size={20} />
            ) : (
              <svg className="login-google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </Button>

          {/* Quick Demo Mode bypass */}
          <button
            type="button"
            className="login-demo-btn"
            onClick={signInAsGuest}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '10px 16px',
              borderRadius: '12px',
              background: '#DDEDE5',
              border: '1px solid #B8CBBF',
              color: '#202725',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Leaf size={15} style={{ color: '#2F6B56' }} />
            <span>Explore App in Demo Mode</span>
          </button>

          {/* Error message */}
          {error && (
            <div className="login-error" role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={signInAsGuest}
                style={{
                  marginTop: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#2F6B56',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Or continue with Demo Mode →
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="login-divider">
            <span>Reuse starts here</span>
          </div>

          {/* Feature highlights */}
          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-dot" style={{ background: 'var(--login-accent-green)' }} />
              <span>Find leftover materials near you</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-dot" style={{ background: 'var(--login-accent-blue)' }} />
              <span>AI-powered project planning</span>
            </div>
            <div className="login-feature">
              <div className="login-feature-dot" style={{ background: 'var(--login-accent-amber)' }} />
              <span>List your leftovers in minutes</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <Leaf size={13} />
          <span>Made for another beginning · By Recursive Minds</span>
        </div>
      </div>
    </div>
  )
}
