import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey !== 'your_firebase_web_api_key' &&
  apiKey.length > 10 &&
  !apiKey.includes('replace_with')
)

const firebaseConfig = {
  apiKey: isFirebaseConfigured ? apiKey : 'AIzaSyDemoFallbackKeyForHackathon000',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resource-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resource-app',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
}

let appInstance: FirebaseApp | null = null
let authInstance: Auth | null = null

if (isFirebaseConfigured) {
  try {
    appInstance = initializeApp(firebaseConfig)
    authInstance = getAuth(appInstance)
  } catch (e) {
    console.warn('Firebase initialization skipped or failed:', e)
  }
}

export const app = appInstance
export const auth = authInstance
export const googleProvider = new GoogleAuthProvider()
