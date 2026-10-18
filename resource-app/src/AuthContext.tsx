import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User, type Auth } from 'firebase/auth'
import { auth, googleProvider, initFirebaseWithConfig } from './firebase'

export type AuthUser = {
  displayName: string | null
  photoURL: string | null
  email: string | null
  uid: string
  isGuest?: boolean
}

type AuthState = {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('resource-guest-user')
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    return null
  })
  const [loading, setLoading] = useState(() => {
    try {
      if (localStorage.getItem('resource-guest-user')) return false
    } catch {}
    return false
  })

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupAuth = (activeAuth: Auth | null) => {
      if (!activeAuth) {
        const stored = localStorage.getItem('resource-guest-user')
        if (stored) {
          try {
            setUser(JSON.parse(stored))
          } catch (e) {
            console.error(e)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
        return
      }

      try {
        unsubscribe = onAuthStateChanged(activeAuth, (firebaseUser: User | null) => {
          if (firebaseUser) {
            setUser({
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              isGuest: false
            })
            localStorage.removeItem('resource-guest-user')
          } else {
            const stored = localStorage.getItem('resource-guest-user')
            if (stored) {
              try {
                setUser(JSON.parse(stored))
              } catch (e) {
                console.error(e)
              }
            } else {
              setUser(null)
            }
          }
          setLoading(false)
        })
      } catch (err) {
        console.warn('Firebase auth listener failed:', err)
        setLoading(false)
      }
    }

    // 1. If auth is already ready (build-time VITE env vars)
    if (auth) {
      setupAuth(auth)
      return () => unsubscribe?.()
    }

    // 2. Fetch runtime config from Cloud Run /api/config
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        const runtimeAuth = data?.firebase?.apiKey ? initFirebaseWithConfig(data.firebase) : null
        setupAuth(runtimeAuth || auth)
      })
      .catch(() => {
        setupAuth(auth)
      })

    return () => unsubscribe?.()
  }, [])

  const signInWithGoogle = async () => {
    let activeAuth = auth
    if (!activeAuth) {
      try {
        const res = await fetch('/api/config')
        const data = await res.json()
        if (data?.firebase?.apiKey) {
          activeAuth = initFirebaseWithConfig(data.firebase)
        }
      } catch (e) {
        console.error(e)
      }
    }

    if (!activeAuth) {
      alert('Google Firebase Auth is not configured on this deployment. Please click "Continue as Demo Guest" to test the app!')
      return
    }

    const res = await signInWithPopup(activeAuth, googleProvider)
    setUser({
      displayName: res.user.displayName,
      photoURL: res.user.photoURL,
      email: res.user.email,
      uid: res.user.uid,
      isGuest: false
    })
    localStorage.removeItem('resource-guest-user')
  }

  const signInAsGuest = () => {
    const guestUser: AuthUser = {
      displayName: 'Maker Demo',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      email: 'demo@resource.local',
      uid: 'guest-user',
      isGuest: true
    }
    setUser(guestUser)
    localStorage.setItem('resource-guest-user', JSON.stringify(guestUser))
  }

  const signOutFn = async () => {
    localStorage.removeItem('resource-guest-user')
    if (auth) {
      try {
        await firebaseSignOut(auth)
      } catch (e) {
        // ignore
      }
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInAsGuest, signOut: signOutFn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
