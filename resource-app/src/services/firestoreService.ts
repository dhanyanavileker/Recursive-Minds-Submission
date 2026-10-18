import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Listing } from '../agent/types'
import type { Requirements } from '../matching'

import type { DeliveryDetails } from '../components/DeliveryTracker'

export interface UserCloudState {
  saved?: number[]
  submitted?: string
  requirements?: Requirements
  ready?: boolean
  karma?: number
  activeDelivery?: DeliveryDetails
}

/**
 * Real-time listener for the shared marketplace listings collection in Firestore.
 */
export function subscribeToListings(
  onUpdate: (items: Listing[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe | null {
  if (!db) return null

  try {
    const listingsRef = collection(db, 'listings')
    return onSnapshot(
      listingsRef,
      snapshot => {
        if (!snapshot.empty) {
          const items: Listing[] = []
          snapshot.forEach(docSnap => {
            const data = docSnap.data() as Listing
            items.push(data)
          })
          // Sort items by id descending so newest appear first
          items.sort((a, b) => (b.id || 0) - (a.id || 0))
          onUpdate(items)
        } else {
          // Collection is empty, notify with empty array so auto-seed can kick in
          onUpdate([])
        }
      },
      error => {
        console.warn('Firestore listings listener error:', error)
        onError?.(error)
      }
    )
  } catch (err) {
    console.warn('Failed to subscribe to Firestore listings:', err)
    onError?.(err)
    return null
  }
}

/**
 * Seeds initial catalog listings to Firestore if the collection is currently empty.
 */
export async function seedListingsIfEmpty(seedItems: Listing[]): Promise<boolean> {
  if (!db) return false

  try {
    const listingsRef = collection(db, 'listings')
    const existing = await getDocs(listingsRef)
    if (!existing.empty) {
      return false // Already has data
    }

    console.info(`Migrating ${seedItems.length} baseline listings to Firestore...`)
    const batch = writeBatch(db)
    for (const item of seedItems) {
      const docRef = doc(db, 'listings', String(item.id))
      batch.set(docRef, {
        ...item,
        migratedAt: serverTimestamp()
      })
    }
    await batch.commit()
    console.info('Successfully migrated all baseline listings to Firestore!')
    return true
  } catch (error) {
    console.warn('Failed to seed listings to Firestore:', error)
    return false
  }
}

/**
 * Forces a reseed of the 24 curated baseline catalog items to Firestore.
 */
export async function reseedAllListings(seedItems: Listing[]): Promise<void> {
  if (!db) return

  const batch = writeBatch(db)
  for (const item of seedItems) {
    const docRef = doc(db, 'listings', String(item.id))
    batch.set(docRef, {
      ...item,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }
  await batch.commit()
}

/**
 * Adds or updates a marketplace listing in Firestore.
 */
export async function saveListingToFirestore(item: Listing, ownerUid?: string): Promise<void> {
  if (!db) return

  const docRef = doc(db, 'listings', String(item.id))
  await setDoc(docRef, {
    ...item,
    ownerUid: ownerUid || null,
    updatedAt: serverTimestamp()
  }, { merge: true })
}

/**
 * Deletes a marketplace listing from Firestore.
 */
export async function deleteListingFromFirestore(id: number): Promise<void> {
  if (!db) return

  const docRef = doc(db, 'listings', String(id))
  await deleteDoc(docRef)
}

/**
 * Loads a user's cloud app state from Firestore.
 */
export async function loadUserState(uid: string): Promise<UserCloudState | null> {
  if (!db || !uid) return null

  try {
    const docRef = doc(db, 'users', uid, 'appState', 'current')
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      return snap.data() as UserCloudState
    }
  } catch (error) {
    console.warn('Failed to load user state from Firestore:', error)
  }
  return null
}

/**
 * Saves a user's cloud app state and profile to Firestore.
 */
export async function saveUserState(
  uid: string,
  profile: {
    displayName: string | null
    email: string | null
    photoURL: string | null
  },
  state: UserCloudState
): Promise<void> {
  if (!db || !uid) return

  await Promise.all([
    setDoc(
      doc(db, 'users', uid),
      {
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    ),
    setDoc(
      doc(db, 'users', uid, 'appState', 'current'),
      {
        ...state,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    )
  ])
}
