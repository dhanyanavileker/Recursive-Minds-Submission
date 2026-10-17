import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, googleProvider } from './firebase'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
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
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
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
          // If guest user exists in localStorage, keep it
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
      return unsubscribe
    } catch (err) {
      console.warn('Firebase auth listener failed or not configured:', err)
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!auth) {
      alert('Google Firebase Auth is not configured on this deployment. Please click "Continue as Demo Guest" to test the app!')
      return
    }
    const res = await signInWithPopup(auth, googleProvider)
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
