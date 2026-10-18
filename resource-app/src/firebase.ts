import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

export let app: FirebaseApp | null = null
export let auth: Auth | null = null
export let db: Firestore | null = null
export const googleProvider = new GoogleAuthProvider()

export function initFirebaseWithConfig(config: {
  apiKey?: string
  authDomain?: string
  projectId?: string
  appId?: string
  storageBucket?: string
  messagingSenderId?: string
  measurementId?: string
}): Auth | null {
  const k = config.apiKey
  if (k && k.length > 10 && k !== 'your_firebase_web_api_key' && !k.includes('replace_with')) {
    try {
      if (!app) {
        app = initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain || 'resource-app.firebaseapp.com',
          projectId: config.projectId || 'resource-app',
          appId: config.appId || '1:1234567890:web:demo',
          storageBucket: config.storageBucket || undefined,
          messagingSenderId: config.messagingSenderId || undefined,
          measurementId: config.measurementId || undefined
        })
      }
      auth = getAuth(app)
      db = getFirestore(app)
      return auth
    } catch (e) {
      console.warn('Firebase dynamic init error:', e)
    }
  }
  return null
}

// Try build-time VITE env vars if present
initFirebaseWithConfig({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
})
