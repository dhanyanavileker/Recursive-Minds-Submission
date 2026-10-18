import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useMobileViewport } from './useMobileViewport'
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Plus,
  Bookmark,
  MapPin,
  ArrowLeft,
  Check,
  Leaf,
  X,
  RotateCcw,
  Package,
  SlidersHorizontal,
  Sparkles,
  LogOut,
  Loader2,
  Truck,
  Award,
  Gift,
  LayoutDashboard,
  MessageSquareCode,
  ShieldCheck,
  Ellipsis,
  Database
} from 'lucide-react'
import {
  subscribeToListings,
  seedListingsIfEmpty,
  reseedAllListings,
  saveListingToFirestore,
  deleteListingFromFirestore,
  loadUserState,
  saveUserState
} from './services/firestoreService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import './App.css'
import { blankRequirements, listingArea, targetArea, areaText } from './matching'
import type { Requirements } from './matching'
import { useAuth } from './AuthContext'
import { db } from './firebase'
import { LoginPage } from './LoginPage'
import { AgentChat } from './agent/AgentChat'
import { DeliveryTracker, DEFAULT_DELIVERY } from './components/DeliveryTracker'
import type { DeliveryDetails } from './components/DeliveryTracker'
import { RewardsModal } from './components/RewardsModal'
import type { RewardsStats } from './components/RewardsModal'

type Listing = {
  id: number
  title: string
  category: string
  qty: number
  unit: string
  price: number
  locality: string
  condition: string
  detail: string
  tone: number
  image?: string
  own?: boolean
  widthCm?: number
  lengthCm?: number
  keywords?: string[]
}

const MATERIAL_IMAGES = [
  '/images/materials/furniture.jpg',
  '/images/materials/electronics.jpg',
  '/images/materials/construction.jpg',
  '/images/materials/tiles.jpg',
  '/images/materials/timber.jpg',
  '/images/materials/pots.jpg',
  '/images/materials/pavers.jpg',
  '/images/materials/fittings.jpg',
]

export const CATEGORIES = [
  'All items',
  'Furniture',
  'Electronic Items',
  'Construction Materials',
  'Packaging',
  'Household Items',
  'Food',
  'Office Assets'
]

const originals: Listing[] = [
  // 1. FURNITURE (6 curated items)
  {
    id: 1,
    title: 'Solid teak side table & matching offcuts',
    category: 'Furniture',
    unit: 'units',
    detail: 'Clean solid teak side table frame and kiln-dried wood offcuts from studio modular build. Smooth sanded finish.',
    qty: 4,
    price: 0,
    locality: 'Central District',
    condition: 'Unused surplus',
    tone: 1,
    image: '/images/materials/furniture.jpg',
    keywords: ['furniture', 'teak', 'table', 'wood', 'timber', 'side table', 'desk']
  },
  {
    id: 2,
    title: 'Ergonomic mesh desk chair with adjustable arms',
    category: 'Furniture',
    unit: 'units',
    detail: 'Lightly used ergonomic studio office chair in clean working condition. Gas-lift cylinder and tilt lock tested.',
    qty: 2,
    price: 0,
    locality: 'North Zone',
    condition: 'Previously used',
    tone: 1,
    image: '/images/materials/desk_chair.jpg',
    keywords: ['furniture', 'chair', 'desk', 'office', 'ergonomic', 'mesh', 'seating']
  },
  {
    id: 3,
    title: 'Birch plywood modular shelving boards',
    category: 'Furniture',
    unit: 'panels',
    detail: '18mm Baltic birch plywood shelf planks (90 × 30 cm) with edge-banding. Surplus from a custom retail fitout.',
    qty: 8,
    price: 0,
    locality: 'West End',
    condition: 'Unused surplus',
    tone: 1,
    image: '/images/materials/plywood_shelves.jpg',
    keywords: ['furniture', 'plywood', 'shelf', 'shelving', 'birch', 'boards', 'planks']
  },
  {
    id: 4,
    title: 'Mid-century solid oak coffee table frame',
    category: 'Furniture',
    unit: 'units',
    detail: 'Sturdy tapered-leg oak frame needing a top surface. Perfect for mosaic tile or glass top upcycling.',
    qty: 1,
    price: 0,
    locality: 'Central District',
    condition: 'Previously used',
    tone: 1,
    image: '/images/materials/coffee_table.jpg',
    keywords: ['furniture', 'table', 'oak', 'coffee table', 'frame', 'wood', 'upcycle']
  },
  {
    id: 5,
    title: 'Solid pine modular workshop bench',
    category: 'Furniture',
    unit: 'units',
    detail: 'Heavy-duty workbench with lower storage shelf. Surface has cosmetic marks but structure is rock solid.',
    qty: 2,
    price: 0,
    locality: 'North Zone',
    condition: 'Previously used',
    tone: 1,
    image: '/images/materials/workbench.jpg',
    keywords: ['furniture', 'bench', 'workbench', 'pine', 'wood', 'workshop', 'table']
  },
  {
    id: 6,
    title: 'Compact two-drawer bedside hardwood cabinet',
    category: 'Furniture',
    unit: 'units',
    detail: 'Clean dark walnut finish side cabinet with smooth drawer slides and brass pull handles.',
    qty: 1,
    price: 0,
    locality: 'West End',
    condition: 'Unused surplus',
    tone: 1,
    image: '/images/materials/bedside_cabinet.jpg',
    keywords: ['furniture', 'cabinet', 'drawers', 'nightstand', 'walnut', 'storage']
  },

  // 2. ELECTRONIC ITEMS (6 curated items)
  {
    id: 7,
    title: 'Tested USB-C monitors & power adapters',
    category: 'Electronic Items',
    unit: 'pieces',
    detail: 'Surplus 24" office displays with clean power bricks, HDMI/DisplayPort cords, and USB-C adapters in tested condition.',
    qty: 6,
    price: 0,
    locality: 'Central District',
    condition: 'Previously used',
    tone: 4,
    image: '/images/materials/electronics.jpg',
    keywords: ['electronics', 'monitors', 'display', 'screen', 'usb-c', 'adapters', 'cables', 'chargers', 'power']
  },
  {
    id: 8,
    title: 'Gigabit dual-band Wi-Fi routers & patch cords',
    category: 'Electronic Items',
    unit: 'units',
    detail: 'Surplus office networking routers with antennas, 12V DC power supplies, and Cat6 patch cables.',
    qty: 5,
    price: 0,
    locality: 'North Zone',
    condition: 'Previously used',
    tone: 4,
    image: '/images/materials/wifi_routers.jpg',
    keywords: ['electronics', 'router', 'wifi', 'networking', 'ethernet', 'cat6', 'cables']
  },
  {
    id: 9,
    title: 'Mechanical keyboards & optical mouse combo',
    category: 'Electronic Items',
    unit: 'sets',
    detail: 'Clean tactile switch USB keyboards and ambidextrous mice. Cleaned, tested, and sanitized for immediate reuse.',
    qty: 8,
    price: 0,
    locality: 'West End',
    condition: 'Unused surplus',
    tone: 4,
    image: '/images/materials/keyboards_mice.jpg',
    keywords: ['electronics', 'keyboard', 'mouse', 'peripherals', 'usb', 'computer']
  },
  {
    id: 10,
    title: 'Compact desktop audio speakers & aux cords',
    category: 'Electronic Items',
    unit: 'pairs',
    detail: 'Powered desktop reference speakers with RCA and 3.5mm input cords. Crisp, balanced sound.',
    qty: 3,
    price: 0,
    locality: 'Central District',
    condition: 'Previously used',
    tone: 4,
    image: '/images/materials/desktop_speakers.jpg',
    keywords: ['electronics', 'speakers', 'audio', 'sound', 'cables', 'monitors']
  },
  {
    id: 11,
    title: 'Multi-port USB-C GaN fast-charging hubs',
    category: 'Electronic Items',
    unit: 'units',
    detail: '65W compact GaN wall chargers with braided USB-C power delivery cables. Ideal for laptop and phone setups.',
    qty: 10,
    price: 0,
    locality: 'North Zone',
    condition: 'Unused surplus',
    tone: 4,
    image: '/images/materials/charging_hubs.jpg',
    keywords: ['electronics', 'chargers', 'usb-c', 'gan', 'power', 'cables', 'hub']
  },
  {
    id: 12,
    title: 'Braided DisplayPort & 4K HDMI cords bundle',
    category: 'Electronic Items',
    unit: 'packs',
    detail: 'Pack of 5 heavy-duty braided video cables (2m length) with gold-plated connectors.',
    qty: 12,
    price: 0,
    locality: 'West End',
    condition: 'Unused surplus',
    tone: 4,
    image: '/images/materials/hdmi_cables.jpg',
    keywords: ['electronics', 'cables', 'hdmi', 'displayport', 'cords', 'video', 'adapters']
  },

  // 3. CONSTRUCTION MATERIALS (6 curated items)
  {
    id: 13,
    title: 'Sea-glass mosaic ceramic tiles',
    category: 'Construction Materials',
    unit: 'pieces',
    detail: 'Ceramic leftover tile lot (10 × 10 cm, 6mm thickness) from splashback remodel. Gloss finish, clean unmortared backs.',
    widthCm: 10,
    lengthCm: 10,
    qty: 48,
    price: 0,
    locality: 'Central District',
    condition: 'Unused surplus',
    tone: 0,
    image: '/images/materials/tiles.jpg',
    keywords: ['tiles', 'ceramic', 'mosaic', 'splashback', 'flooring', 'wall', 'bath', 'construction']
  },
  {
    id: 14,
    title: 'Solid pine 2x4 framing lumber offcuts',
    category: 'Construction Materials',
    unit: 'pieces',
    detail: 'Clean untreated pine lumber offcuts, approximately 50–70 cm long. Squared cut ends, dry and straight.',
    widthCm: 9,
    lengthCm: 60,
    qty: 18,
    price: 0,
    locality: 'North Zone',
    condition: 'Unused surplus',
    tone: 1,
    image: '/images/materials/construction.jpg',
    keywords: ['timber', 'wood', 'pine', 'lumber', '2x4', 'offcuts', 'planks', 'boards', 'construction']
  },
  {
    id: 15,
    title: 'Architectural dressed sandstone & granite pavers',
    category: 'Construction Materials',
    unit: 'slabs',
    detail: 'Heavy-duty 30 × 30 cm textured stone pavers, 3.5cm thickness. Non-slip surface suitable for pathways or garden patios.',
    widthCm: 30,
    lengthCm: 30,
    qty: 24,
    price: 0,
    locality: 'West End',
    condition: 'Unused surplus',
    tone: 3,
    image: '/images/materials/pavers.jpg',
    keywords: ['pavers', 'stone', 'sandstone', 'granite', 'slabs', 'pathway', 'patio', 'construction']
  },
  {
    id: 16,
    title: 'Clean reclaimed red cedar plank boards',
    category: 'Construction Materials',
    unit: 'pieces',
    detail: 'Naturally weather-resistant cedar slats (approx. 80 cm long, 10 cm wide). Ideal for planters, screens, or outdoor accents.',
    widthCm: 10,
    lengthCm: 80,
    qty: 14,
    price: 0,
    locality: 'Central District',
    condition: 'Unused surplus',
    tone: 1,
    image: '/images/materials/timber.jpg',
    keywords: ['timber', 'cedar', 'wood', 'planks', 'boards', 'slats', 'outdoor', 'construction']
  },
  {
    id: 17,
    title: 'Solid brushed brass handles & cabinet hinges',
    category: 'Construction Materials',
    unit: 'sets',
    detail: 'Surplus architectural cabinet hardware lot with mounting screws (standard 96mm and 128mm hole spacing).',
    qty: 16,
    price: 0,
    locality: 'North Zone',
    condition: 'Unused surplus',
    tone: 4,
    image: '/images/materials/fittings.jpg',
    keywords: ['fittings', 'hardware', 'brass', 'handles', 'hinges', 'cabinet', 'screws', 'construction']
  },
  {
    id: 18,
    title: 'Terracotta garden wall & step capping tiles',
    category: 'Construction Materials',
    unit: 'pieces',
    detail: 'Warm terracotta tiles with bullnose edging (15 × 15 cm). Perfect for step risers, planters, or garden wall caps.',
    widthCm: 15,
    lengthCm: 15,
    qty: 32,
    price: 0,
    locality: 'West End',
    condition: 'Unused surplus',
    tone: 2,
    image: '/images/materials/capping_tiles.jpg',
    keywords: ['tiles', 'terracotta', 'capping', 'garden', 'wall', 'steps', 'ceramic', 'construction']
  },

  // 4. PACKAGING, HOUSEHOLD & COMMUNITY ASSETS (6 curated items)
  {
    id: 19,
    title: 'Heavy-duty 5-ply shipping boxes with inserts',
    category: 'Packaging',
    unit: 'boxes',
    detail: 'Double-wall clean cardboard shipping boxes (pack of 20) with padded bubble inserts. Flat-packed and dry.',
    qty: 20,
    price: 0,
    locality: 'Central District',
    condition: 'Unused surplus',
    tone: 2,
    image: '/images/materials/shipping_boxes.jpg',
    keywords: ['boxes', 'packaging', 'cardboard', 'shipping', 'cartons', 'packing', 'bubble', 'storage']
  },
  {
    id: 20,
    title: 'Terracotta flower pots & drainage saucers',
    category: 'Household Items',
    unit: 'pots',
    detail: 'Traditional porous clay pots (18–25 cm diameter) with saucers. Clean and ready for balcony or terrace planting.',
    qty: 14,
    price: 0,
    locality: 'North Zone',
    condition: 'Previously used',
    tone: 2,
    image: '/images/materials/pots.jpg',
    keywords: ['pots', 'pot', 'planter', 'planters', 'terracotta', 'clay', 'garden', 'plants', 'drainage']
  },
  {
    id: 21,
    title: 'Modular acoustic desk divider screens & clamps',
    category: 'Office Assets',
    unit: 'panels',
    detail: 'Fabric-wrapped sound-absorbing desk partition screens (120 × 40 cm) with universal edge-mounting desk brackets.',
    qty: 6,
    price: 0,
    locality: 'West End',
    condition: 'Unused surplus',
    tone: 0,
    image: '/images/materials/acoustic_dividers.jpg',
    keywords: ['office', 'partitions', 'panels', 'acoustic', 'dividers', 'studio', 'desk']
  },
  {
    id: 22,
    title: 'Biodegradable honeycomb kraft paper wrap roll',
    category: 'Packaging',
    unit: 'rolls',
    detail: 'Eco-friendly protective honeycomb paper packing roll (50m length). Great alternative to plastic bubble wrap.',
    qty: 3,
    price: 0,
    locality: 'Central District',
    condition: 'Unused surplus',
    tone: 2,
    image: '/images/materials/kraft_paper.jpg',
    keywords: ['packaging', 'kraft', 'paper', 'honeycomb', 'wrap', 'shipping', 'eco']
  },
  {
    id: 23,
    title: 'Glazed ceramic indoor planters with saucers',
    category: 'Household Items',
    unit: 'pots',
    detail: 'White and sage green glazed indoor plant pots with drainage holes (15cm and 20cm diameters).',
    qty: 8,
    price: 0,
    locality: 'North Zone',
    condition: 'Unused surplus',
    tone: 2,
    image: '/images/materials/glazed_pots.jpg',
    keywords: ['pots', 'planter', 'ceramic', 'glazed', 'indoor', 'plants', 'decor']
  },
  {
    id: 24,
    title: 'Studio magnetic rolling whiteboard easel',
    category: 'Office Assets',
    unit: 'units',
    detail: 'Double-sided rolling magnetic whiteboard with aluminum frame and accessory tray. Collapsible for easy transport.',
    qty: 2,
    price: 0,
    locality: 'West End',
    condition: 'Previously used',
    tone: 0,
    image: '/images/materials/whiteboard_easel.jpg',
    keywords: ['office', 'whiteboard', 'easel', 'magnetic', 'studio', 'presentation']
  }
]

const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function App() {
  useMobileViewport()
  const { user, loading: authLoading } = useAuth()

  // Auth loading state
  if (authLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F3E8' }}>
        <Loader2 size={32} style={{ color: '#2F6B56', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  // Not signed in — show login page
  if (!user) return <LoginPage />

  return <AuthenticatedApp />
}

function AuthenticatedApp() {
  const { user, signOut } = useAuth()
  const [items, setItems] = useState<Listing[]>(() => {
    const loaded = load('resource-items-v4', originals)
    if (
      !Array.isArray(loaded) ||
      loaded.length < 18 ||
      loaded.some(x => x.title?.includes('batch') || x.title?.includes('Scout') || x.title?.includes('Demolition Lot')) ||
      loaded[1]?.image === '/images/materials/furniture.jpg'
    ) {
      localStorage.setItem('resource-items-v4', JSON.stringify(originals))
      return originals
    }
    return loaded
  })
  const [saved, setSaved] = useState<number[]>(() => load('resource-saved', []))

  // View modes: 'dashboard' | 'chat' | 'project' | 'mine' | 'list'
  const [view, setView] = useState<string>('dashboard')
  const [category, setCategory] = useState('All items')
  const [locality, setLocality] = useState('All localities')
  const [free, setFree] = useState(false)
  const [submitted, setSubmitted] = useState<string>(() => load('resource-request', ''))
  const [selected, setSelected] = useState<Listing | null>(null)
  const [notice, setNotice] = useState('')
  const [reset, setReset] = useState(false)
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)

  const goInventoryView = (next: 'dashboard' | 'project' | 'mine') => {
    setMobileMoreOpen(false)
    setView(next)
    setCategory('All items')
    setLocality('All localities')
    setFree(false)
  }

  // Ensure scroll is reset smoothly to top on view change to prevent jumping
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [view])

  useEffect(() => {
    if (selected) setMobileMoreOpen(false)
  }, [selected])

  useEffect(() => {
    document.body.classList.add('mobile-app-shell')
    return () => document.body.classList.remove('mobile-app-shell')
  }, [])

  // Listing creation form state
  const [step, setStep] = useState(0)
  const [sample, setSample] = useState(false)
  const [photo, setPhoto] = useState('')
  const [title, setTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Materials')
  const [quantity, setQuantity] = useState('')
  const [newLocality, setNewLocality] = useState('Central District')
  const [condition, setCondition] = useState('Unused surplus')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [newWidth, setNewWidth] = useState('')
  const [newLength, setNewLength] = useState('')
  const [pickupWindow, setPickupWindow] = useState('')

  // Requirements & AI Planner state
  const [requirements, setRequirements] = useState<Requirements>(() => load('resource-brief', blankRequirements))
  const [ready, setReady] = useState(() => load('resource-brief-ready', false))

  // Rewards & Karma System state
  const [karma, setKarma] = useState<number>(() => load('resource-karma', 850))
  const [rewardsOpen, setRewardsOpen] = useState(false)

  // Low-Emission Logistics Tracking state
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [activeDelivery, setActiveDelivery] = useState<DeliveryDetails>(() => load('resource-active-delivery-v2', DEFAULT_DELIVERY))
  const [cloudStateReady, setCloudStateReady] = useState(false)
  const [firestoreLive, setFirestoreLive] = useState(false)
  const [firestoreError, setFirestoreError] = useState<string | null>(null)

  // AI Chat direct prompt trigger
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string | null>(null)

  // 1. Subscribe to shared marketplace listings in Firestore
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as any).__reseedFirestore = () => reseedAllListings(originals)
      ;(window as any).__seedListings = () => seedListingsIfEmpty(originals)
    }

    const unsub = subscribeToListings(
      async (cloudItems) => {
        setFirestoreLive(true)
        setFirestoreError(null)
        if (cloudItems.length === 0) {
          // If Firestore collection is empty or being sanitized, set to originals and auto-seed
          setItems(originals)
          localStorage.setItem('resource-items-v4', JSON.stringify(originals))
          await seedListingsIfEmpty(originals)
        } else {
          setItems(cloudItems)
          localStorage.setItem('resource-items-v4', JSON.stringify(cloudItems))
        }
      },
      (error: any) => {
        console.warn('Firestore listings subscription error, using local fallback:', error)
        if (error?.code === 'permission-denied' || String(error).includes('permission')) {
          setFirestoreError('Publish firestore.rules in Firebase Console')
        } else {
          setFirestoreError(error?.message || 'Connection error')
        }
      }
    )
    return () => {
      unsub?.()
    }
  }, [])

  // 2. Load user personal app state from Firestore
  useEffect(() => {
    if (!user || user.isGuest || !db) {
      setCloudStateReady(true)
      return
    }

    let cancelled = false
    const loadState = async () => {
      try {
        const cloudState = await loadUserState(user.uid)
        if (cancelled) return
        if (cloudState) {
          if (Array.isArray(cloudState.saved)) setSaved(cloudState.saved)
          if (typeof cloudState.submitted === 'string') setSubmitted(cloudState.submitted)
          if (cloudState.requirements) setRequirements(cloudState.requirements)
          if (typeof cloudState.ready === 'boolean') setReady(cloudState.ready)
          if (typeof cloudState.karma === 'number') setKarma(cloudState.karma)
          if (cloudState.activeDelivery) setActiveDelivery(cloudState.activeDelivery)
        }
      } catch (error) {
        console.warn('Firestore user state could not be loaded; continuing with local data.', error)
      } finally {
        if (!cancelled) setCloudStateReady(true)
      }
    }
    void loadState()
    return () => { cancelled = true }
  }, [user])

  // 3. Continuously sync user personal app state to Firestore
  useEffect(() => {
    if (!cloudStateReady || !user || user.isGuest || !db) return
    const timer = window.setTimeout(() => {
      const state = { saved, submitted, requirements, ready, karma, activeDelivery }
      void saveUserState(
        user.uid,
        { displayName: user.displayName, email: user.email, photoURL: user.photoURL },
        state
      ).catch(error => console.warn('Firestore sync failed; local data is still available.', error))
    }, 500)
    return () => window.clearTimeout(timer)
  }, [activeDelivery, cloudStateReady, karma, ready, requirements, saved, submitted, user])

  const selectedItems = items.filter(x => saved.includes(x.id))
  const compatibleItems = selectedItems.filter(x => x.category === requirements.category)
  const knownArea = compatibleItems.reduce((n, x) => n + (listingArea(x) ?? 0), 0)
  const unknownArea = compatibleItems.filter(x => listingArea(x) === null).length
  const projectArea = targetArea(requirements)

  const updateRequirements = (r: Requirements) => {
    setRequirements(r)
    setReady(false)
    localStorage.setItem('resource-brief', JSON.stringify(r))
    localStorage.setItem('resource-brief-ready', 'false')
  }

  const confirmRequirements = async () => {
    try {
      await Promise.resolve()
      setCategory('All materials')
      setLocality(requirements.locality)
      setFree(false)
      setReady(true)
      localStorage.setItem('resource-brief-ready', 'true')
    } catch (e) {
      console.error(e)
    }
  }

  const persist = (next: Listing[]) => {
    setItems(next)
    localStorage.setItem('resource-items-v4', JSON.stringify(next))
  }

  const toggle = (id: number) => {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem('resource-saved', JSON.stringify(next))
  }

  const addKarmaPoints = (points: number) => {
    const updated = karma + points
    setKarma(updated)
    localStorage.setItem('resource-karma', JSON.stringify(updated))
  }

  const q = submitted.toLowerCase()
  const inferred = /construct|tile|mosaic|timber|wood|pine|paver|stone|gravel|metal|material|masonry/.test(q)
    ? 'Construction Materials'
    : /chair|table|desk|shelf|furniture|stool|bench|couch/.test(q)
    ? 'Furniture'
    : /cable|charger|monitor|display|tech|electron|wire|battery|cord|usb/.test(q)
    ? 'Electronic Items'
    : /box|packag|bubble|carton|wrap|corrugat|mailer/.test(q)
    ? 'Packaging'
    : /pot|plant|garden|handle|decor|kitchen|towel|household/.test(q)
    ? 'Household Items'
    : /food|grocery|grain|pulse|coffee|tea|snack|pantry/.test(q)
    ? 'Food'
    : /office|whiteboard|stationery|easel|divider|partition/.test(q)
    ? 'Office Assets'
    : ''

  const shown = items.filter(
    x =>
      (view === 'project' ? saved.includes(x.id) : view === 'mine' ? x.own : true) &&
      (category === 'All items' || category === 'All categories' || category === 'All materials' || x.category === category) &&
      (locality === 'All localities' || x.locality === locality) &&
      (!free || x.price === 0) &&
      (!submitted ||
        (x.title + ' ' + x.category + ' ' + (x.keywords || []).join(' ') + ' ' + x.detail).toLowerCase().includes(q) ||
        (inferred ? x.category === inferred : false))
  )

  const beginList = () => {
    setView('list')
    setStep(0)
    setSample(false)
    setPhoto('')
    setTitle('')
    setQuantity('')
    setConfirmed(false)
    setNewWidth('')
    setNewLength('')
    setPickupWindow('')
    setError('')
  }

  const publish = () => {
    if (
      !title.trim() ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0 ||
      ((newWidth || newLength) &&
        (!newWidth || !newLength || !Number.isFinite(Number(newWidth)) || !Number.isFinite(Number(newLength)) || Number(newWidth) <= 0 || Number(newLength) <= 0)) ||
      !confirmed
    ) {
      setError('Add a title, a quantity greater than zero, valid dimensions (or leave both blank), and confirm the details.')
      return
    }
    const catIdx = CATEGORIES.indexOf(newCategory)
    const item: Listing = {
      id: Date.now(),
      title: title.trim(),
      category: newCategory,
      qty: Number(quantity),
      unit: newCategory === 'Pots' || newCategory === 'Household Items' ? 'pieces' : 'units',
      price: 0, // Mindful giveaway
      locality: newLocality,
      condition,
      widthCm: newWidth ? Number(newWidth) : undefined,
      lengthCm: newLength ? Number(newLength) : undefined,
      detail: `Owner-confirmed demo listing. Pickup window: ${pickupWindow.trim() || 'Flexible community pickup'}. Suitability and availability still need confirmation.`,
      tone: catIdx >= 0 ? catIdx % 5 : 0,
      image: photo || MATERIAL_IMAGES[Math.max(0, (catIdx >= 0 ? catIdx : 0) % MATERIAL_IMAGES.length)],
      own: true
    }
    persist([item, ...items])
    void saveListingToFirestore(item, user?.uid).catch(err => {
      console.warn('Could not sync listing to Firestore:', err)
    })
    addKarmaPoints(150)
    setView('mine')
    setLocality('All localities')
    setFree(false)
    setCategory('All items')
    setSubmitted('')
    setNotice('🎉 Demo giveaway published! +150 prototype Karma points added.')
  }

  // Trigger Sustainable Delivery Tracking for an item
  const handleClaimPorter = (item: Listing) => {
    const updatedDelivery: DeliveryDetails = {
      ...DEFAULT_DELIVERY,
      id: `ECO-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: `${item.title} (${item.qty} ${item.unit})`,
      category: item.category,
      quantity: `${item.qty} ${item.unit}`,
      donorLocality: `${item.locality} (Donor Site)`,
      recipientLocality: 'Koramangala / Project Site',
      stage: 3, // In Transit
      etaMinutes: 14,
      otp: `${Math.floor(1000 + Math.random() * 9000)}`
    }
    setActiveDelivery(updatedDelivery)
    localStorage.setItem('resource-active-delivery', JSON.stringify(updatedDelivery))
    if (!saved.includes(item.id)) toggle(item.id)
    setDeliveryOpen(true)
    setNotice(`Delivery simulation started for "${item.title}". No real booking was created.`)
  }

  // Trigger AI Architect with pre-filled prompt from "Build Something"
  const handleBuildPrompt = (promptText: string) => {
    setAgentInitialPrompt(promptText)
    setView('chat')
  }

  const rewardsStats: RewardsStats = {
    karma,
    wasteDivertedKg: 64.5,
    co2SavedKg: 42.0,
    giveawaysCount: 4,
    buildsCount: 3
  }

  const isChat = view === 'chat' || view === 'find'

  return (
    <div className={'app ' + (isChat ? 'chat-mode' : '')}>
      <a className="skip" href="#main">
        Skip to content
      </a>

      {/* Main App Header */}
      <header>
        <button className="brand" onClick={() => setView('dashboard')} aria-label="Re:Source home">
          <span className="brand-mark">
            <Leaf size={23} />
          </span>
          re<span className="colon">:</span>source<span className="brand-dot">®</span>
        </button>

        {/* Mode Switcher: Dashboard Mode vs AI Chat Mode */}
        <div className="mode-toggle" role="group" aria-label="View Mode Switcher">
          <button
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => {
              setView('dashboard')
              setCategory('All materials')
            }}
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button
            className={isChat ? 'active' : ''}
            onClick={() => {
              setView('chat')
              setCategory('All materials')
            }}
          >
            <MessageSquareCode size={14} /> AI Copilot
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav aria-label="Main navigation">
          <button
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => {
              setView('dashboard')
              setCategory('All materials')
            }}
          >
            Giveaways
          </button>
          <button
            className={view === 'project' ? 'active' : ''}
            onClick={() => {
              setView('project')
              setCategory('All materials')
              setLocality('All localities')
              setFree(false)
            }}
          >
            My project <span className="count">{saved.length}</span>
          </button>
          <button
            className={view === 'mine' ? 'active' : ''}
            onClick={() => {
              setView('mine')
              setCategory('All materials')
              setLocality('All localities')
              setFree(false)
            }}
          >
            My gifts
          </button>
        </nav>

        {/* Actions & Header Badges */}
        <div className="header-actions">
          <div className="header-pills">
            {/* Rewards Pill */}
            <button
              className="karma-header-pill"
              onClick={() => setRewardsOpen(true)}
              title="Open demo rewards preview"
            >
              <Award size={14} />
              <span>{karma} Demo Karma</span>
            </button>

            {/* Green Delivery Tracker Pill */}
            <button
              className="porter-header-pill"
              onClick={() => setDeliveryOpen(true)}
              title="Open simulated delivery preview"
            >
              <span className="pulsing-dot" />
              <Truck size={14} />
              <span>Delivery Demo</span>
            </button>

            {/* Firestore Cloud Sync Status */}
            <div
              className={`firestore-status-pill ${firestoreLive ? 'live' : firestoreError ? 'warning' : 'connecting'}`}
              title={
                firestoreLive
                  ? "Firestore connected: All materials, project briefs, and giveaways sync live to Google Cloud Firestore"
                  : firestoreError
                  ? `Firestore connected to project 'resource-exchange-dashboard', but rules are needed: ${firestoreError}`
                  : "Connecting to Firestore..."
              }
            >
              <Database
                size={13}
                style={{
                  color: firestoreLive ? '#2F6B56' : firestoreError ? '#b45309' : '#d97706'
                }}
              />
              <span>
                {firestoreLive
                  ? 'Firestore Live'
                  : firestoreError
                  ? 'Rules Needed'
                  : 'Connecting...'}
              </span>
            </div>
          </div>

          <Button onClick={beginList} className="list-button" aria-label="Give leftovers">
            <Plus size={16} /> <span className="list-button-label">Give Leftovers</span>
          </Button>

          {user && (
            <div className="user-menu">
              {user.photoURL ? (
                <img
                  className="user-avatar"
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="user-avatar user-avatar-fallback" aria-label={user.displayName || 'User'}>
                  {(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}
                </span>
              )}
              <button className="sign-out-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Demo bar */}
      <div className="demo-bar">
        <span>
          <span className="status-dot" /> Re:Source Circular Network · Mindfully giving away leftovers across the region
        </span>
        <button onClick={() => setReset(true)}>
          <RotateCcw size={12} /> Reset demo
        </button>
      </div>

      {notice && (
        <div className="notice" role="status">
          {notice}
          <button aria-label="Dismiss notification" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main">
        {/* VIEW 1: AI Agent Chat Mode */}
        {isChat && (
          <AgentChat
            items={items}
            saved={saved}
            onToggleSave={toggle}
            onAddItem={newItem => {
              persist([newItem, ...items])
              if (!saved.includes(newItem.id)) toggle(newItem.id)
              setNotice(`Order confirmed! Added "${newItem.title}" to My Project.`)
              void saveListingToFirestore(newItem, user?.uid).catch(err => {
                console.warn('Could not sync agent item to Firestore:', err)
              })
            }}
            onSelectItem={setSelected}
            onViewProject={() => {
              setView('project')
              setCategory('All materials')
              setLocality('All localities')
              setFree(false)
            }}
            onBeginList={beginList}
            requirements={requirements}
            onRequirementsChange={updateRequirements}
            ready={ready}
            onConfirmRequirements={confirmRequirements}
            onEditRequirements={() => {
              setReady(false)
              localStorage.setItem('resource-brief-ready', 'false')
            }}
            initialPrompt={agentInitialPrompt}
            onClearInitialPrompt={() => setAgentInitialPrompt(null)}
          />
        )}

        {/* VIEW 2: List Leftovers Giveaway Flow */}
        {view === 'list' && (
          <section className="listing-flow">
            <button className="text-link" onClick={() => setView('dashboard')}>
              <ArrowLeft size={16} /> Back to dashboard
            </button>
            <h1>
              Share what's useful.<br />
              <span>Save what matters.</span>
            </h1>
            <p>Mindfully give your leftover materials a useful next chapter. No reselling fees — 100% free community reuse.</p>
            <div className="steps">
              <span className={step === 0 ? 'current' : ''}>1. Add a photo</span>
              <span className={step === 1 ? 'current' : ''}>2. Confirm details</span>
            </div>
            {step === 0 ? (
              <div className="upload-layout">
                <div className="upload">
                  <Package size={36} />
                  <h2>Start with what you have</h2>
                  <p>Choose an image of your surplus items — furniture, electronic items, construction materials, or other goods — or explore with our illustrated sample.</p>
                  <label className="upload-label">
                    Choose photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        if (f.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
                          setError('Choose a JPG, PNG or WebP image smaller than 5 MB.')
                          return
                        }
                        const r = new FileReader()
                        r.onload = () => {
                          setPhoto(String(r.result))
                          setSample(false)
                          setStep(1)
                          setError('')
                        }
                        r.readAsDataURL(f)
                      }}
                    />
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSample(true)
                      setTitle('Sea-glass mosaic ceramic tiles')
                      setQuantity('')
                      setNewCategory('Construction Materials')
                      setStep(1)
                    }}
                  >
                    Use illustrated sample <ArrowRight size={16} />
                  </Button>
                  <small>Community sharing connects useful resources with nearby individuals, organizations, and community projects.</small>
                </div>
                <div className="sample-preview">
                  <Material tone={0} />
                  <span>Illustrated sample · ceramic tile leftovers</span>
                </div>
              </div>
            ) : (
              <div className="details-layout">
                <div>
                  {photo ? (
                    <img className="uploaded-image" src={photo} alt="Your selected leftover materials" />
                  ) : (
                    <Material tone={0} />
                  )}
                  <div className="fact-note">
                    <Sparkles size={17} />
                    <div>
                      <strong>{sample ? 'Sample details' : 'Mindful giveaway verification'}</strong>
                      <p>
                        {sample
                          ? 'These are sample values. Review and confirm every field.'
                          : 'Enter the details of your surplus materials for the community.'}
                      </p>
                    </div>
                  </div>
                  <div className="suggestion-facts">
                    <h3>Community Giveaway Standards</h3>
                    <p>
                      Materials must be safe to handle and usable for DIY, repairs, or art.
                    </p>
                    <p>Earn +150 Karma upon publication to redeem for sustainable delivery credits.</p>
                  </div>
                  <button className="text-link" onClick={() => setStep(0)}>
                    Change image
                  </button>
                </div>
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    publish()
                  }}
                >
                  <h3>Giveaway Details</h3>
                  <p className="requirements-note">Review title and quantity. Giveaways are 100% free to recipient.</p>
                  <label>
                    Listing title
                    <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} required />
                  </label>
                  <div className="field-grid">
                    <label>
                      Category
                      <select value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                        {CATEGORIES.filter(x => x !== 'All items').map(x => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Quantity (pieces / pots)
                      <Input type="number" min="1" required value={quantity} onChange={e => setQuantity(e.target.value)} />
                    </label>
                    <label>
                      Pricing Mode
                      <Input value="100% Free Giveaway (0 ₹)" disabled />
                    </label>
                    <label>
                      Locality
                      <select value={newLocality} onChange={e => setNewLocality(e.target.value)}>
                        {['Central District', 'North Zone', 'West End', 'South Suburbs', 'East River'].map(x => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="field-grid">
                    <label>
                      Piece width (cm, optional)
                      <Input type="number" step="any" min="0.1" value={newWidth} onChange={e => setNewWidth(e.target.value)} />
                    </label>
                    <label>
                      Piece length (cm, optional)
                      <Input type="number" step="any" min="0.1" value={newLength} onChange={e => setNewLength(e.target.value)} />
                    </label>
                  </div>
                  <label>
                    Pickup window (optional)
                    <Input
                      value={pickupWindow}
                      maxLength={100}
                      onChange={e => setPickupWindow(e.target.value)}
                      placeholder="e.g. Saturday, 10 am–1 pm or low-emission courier pickup"
                    />
                  </label>
                  <label>
                    Condition
                    <select value={condition} onChange={e => setCondition(e.target.value)}>
                      <option>Unused surplus</option>
                      <option>Previously used</option>
                      <option>Needs checking</option>
                    </select>
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                    I confirm these materials are being mindfully given away for circular reuse.
                  </label>
                  <Button type="submit">
                    Publish Free Giveaway (+150 Karma) <ArrowRight size={16} />
                  </Button>
                </form>
              </div>
            )}
            {error && <p role="alert" className="error">{error}</p>}
          </section>
        )}

        {/* VIEW 3: Dashboard View (Pitch Hero, 3 Entry Points, Impact Ticker, Inventory) */}
        {!isChat && view !== 'list' && (
          <section className="inventory">
            {view === 'dashboard' && (
              <>
                {/* Manifesto & Pitch Hero */}
                <div className="dashboard-hero">
                  <div className="pitch-badge">
                    <Leaf size={14} /> NOT RESELLING · CIRCULAR RESOURCE EXCHANGE
                  </div>
                  <h1>
                    Nothing useful<br />
                    <span>should become waste.</span>
                  </h1>
                  <p className="hero-tagline">
                    Transform surplus into value through Gemini-assisted planning and evidence-based resource matching, with clearly labelled previews of future rewards and logistics.
                  </p>

                  {/* 3 Interactive Entry Points */}
                  <div className="entry-cards-grid">
                    {/* Card 1: Give Resource */}
                    <div className="entry-card primary">
                      <div className="entry-card-header">
                        <div className="entry-icon-wrap">
                          <Gift size={22} />
                        </div>
                        <span className="entry-pill">+150 KARMA</span>
                      </div>
                      <h3>Give Resource</h3>
                      <p>
                        Have surplus furniture, electronic items, or construction materials? Post a mindful giveaway in 30 seconds to give them a second life.
                      </p>
                      <Button onClick={beginList} className="entry-action-btn">
                        Post a Free Giveaway <ArrowRight size={15} />
                      </Button>
                    </div>

                    {/* Card 2: Need Resource */}
                    <div className="entry-card">
                      <div className="entry-card-header">
                        <div className="entry-icon-wrap">
                          <Search size={22} />
                        </div>
                        <span className="entry-pill">0 ₹ SURPLUS</span>
                      </div>
                      <h3>Need Resource</h3>
                      <p>
                        Searching for furniture, electronic items, or construction materials? Claim community surplus nearby for free before it reaches landfills.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const el = document.getElementById('inventory-section')
                          el?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="entry-action-btn"
                      >
                        Browse Free Giveaways <ArrowRight size={15} />
                      </Button>
                    </div>

                    {/* Card 3: Build Something (AI Project Architect) */}
                    <div className="entry-card">
                      <div className="entry-card-header">
                        <div className="entry-icon-wrap">
                          <Sparkles size={22} />
                        </div>
                        <span className="entry-pill ai">AI ARCHITECT</span>
                      </div>
                      <h3>Build Something</h3>
                      <p>
                        Tell AI what you want to build with furniture, electronic items, or construction materials. It auto-generates blueprints and matches inventory!
                      </p>
                      <div className="build-chips-list">
                        <button
                          type="button"
                          className="build-chip-btn"
                          onClick={() => handleBuildPrompt('I want to build a garden planter box using surplus construction materials')}
                        >
                          Planter · Construction
                        </button>
                        <button
                          type="button"
                          className="build-chip-btn"
                          onClick={() => handleBuildPrompt('I want to build a reclaimed wood desk or restore modular furniture')}
                        >
                          Work Desk · Furniture
                        </button>
                        <button
                          type="button"
                          className="build-chip-btn"
                          onClick={() => handleBuildPrompt('How can I reuse surplus USB-C monitors and power adapters for an eco tech station?')}
                        >
                          Tech Setup · Electronics
                        </button>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleBuildPrompt('I want to architect a new DIY build project using local leftover materials')}
                        className="entry-action-btn"
                      >
                        Launch AI Copilot <Sparkles size={15} />
                      </Button>
                    </div>
                  </div>

                  {/* AI Circular Intelligence & Ecosystem Metrics Cards (Points 3 & 4) */}
                  <div className="ecosystem-impact-showcase">
                    {/* Card 1: AI Autonomous Matchmaker (Core Innovation) */}
                    <div className="impact-card ai-matching-card">
                      <div>
                        <div className="impact-card-badge">
                          <Sparkles size={14} /> PROTOTYPE SCENARIO · ILLUSTRATIVE DATA
                        </div>
                        <div className="impact-card-headline">
                          <h3>AI Autonomous Match Engine</h3>
                          <p>Structured AI planning works with deterministic inventory filters and explicit uncertainty.</p>
                        </div>
                      </div>
                      <div className="impact-stats-trio">
                        <div className="impact-stat-box">
                          <span className="stat-num">AI</span>
                          <span className="stat-label">Project planning</span>
                          <span className="stat-sub">structured reuse blueprints</span>
                        </div>
                        <div className="impact-stat-box">
                          <span className="stat-num">24</span>
                          <span className="stat-label">Demo listings</span>
                          <span className="stat-sub">fictional evaluation inventory</span>
                        </div>
                        <div className="impact-stat-box accent">
                          <span className="stat-num">Rules</span>
                          <span className="stat-label">Evidence checks</span>
                          <span className="stat-sub">quantity, area and locality</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Citywide Circular Ecosystem Impact */}
                    <div className="impact-card community-ecosystem-card">
                      <div>
                        <div className="impact-card-badge community">
                          <Leaf size={14} /> PROPOSED IMPACT · NOT YET MEASURED
                        </div>
                        <div className="impact-card-headline">
                          <h3>Regional Circular Ecosystem</h3>
                          <p>Coordinating surplus redistribution across maker communities and project sites.</p>
                        </div>
                      </div>
                      <div className="impact-stats-trio">
                        <div className="impact-stat-box">
                          <span className="stat-num">3</span>
                          <span className="stat-label">Demo localities</span>
                          <span className="stat-sub">illustrative coverage only</span>
                        </div>
                        <div className="impact-stat-box">
                          <span className="stat-num">0</span>
                          <span className="stat-label">Measured transfers</span>
                          <span className="stat-sub">real-world pilot pending</span>
                        </div>
                        <div className="impact-stat-box rate">
                          <span className="stat-num">Next</span>
                          <span className="stat-label">User validation</span>
                          <span className="stat-sub">measure completion and trust</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Circular Impact & Delivery Ticker Bar */}
                  <div className="impact-ticker-bar">
                    <div className="impact-stat-group">
                      <div
                        className="impact-stat-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setRewardsOpen(true)}
                        title="Click to view Circular Rewards Vault"
                      >
                        <Award size={20} style={{ color: '#f6c065' }} />
                        <div>
                          <strong>{karma} Karma</strong>
                          <span>Community Rewards Level 3</span>
                        </div>
                      </div>
                      <div className="impact-stat-item">
                        <Leaf size={20} style={{ color: '#86EFAC' }} />
                        <div>
                          <strong>Demo impact estimate</strong>
                          <span>Not measured in a live deployment</span>
                        </div>
                      </div>
                      <div className="impact-stat-item">
                        <ShieldCheck size={20} style={{ color: '#25d9f0' }} />
                        <div>
                          <strong>CO₂e methodology pending</strong>
                          <span>No verified emissions claim</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Green Delivery Logistics Banner */}
                    <button
                      type="button"
                      className="active-porter-strip"
                      onClick={() => setDeliveryOpen(true)}
                      title="Open the simulated delivery preview"
                    >
                      <span className="pulsing-dot" />
                      <Truck size={16} />
                      <span>Simulated low-emission delivery preview</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Section Header */}
            <div className="section-title" id="inventory-section">
              <div>
                <h2>
                  {view === 'project'
                    ? 'Your Saved Project Materials'
                    : view === 'mine'
                    ? 'Your Mindful Giveaways'
                    : 'Community Mindful Giveaways'}
                </h2>
                <p>
                  {view === 'project'
                    ? 'Materials saved for your upcoming circular project. Compare dimensions and schedule a low-emission pickup.'
                    : view === 'mine'
                    ? 'Materials you are mindfully giving away to fellow builders.'
                    : 'Fictional demo inventory for evaluating local circular-reuse journeys.'}
                </p>
              </div>
              {view === 'project' && saved.length > 0 && (
                <Button onClick={() => setDeliveryOpen(true)}>
                  Schedule Low-Emission Delivery <ArrowUpRight size={16} />
                </Button>
              )}
              <span className="inventory-count">
                {shown.length} {view === 'project' ? 'saved' : 'giveaways available'}
              </span>
            </div>

            {/* Material Project Plan View */}
            {view === 'project' && selectedItems.length > 0 && (
              <section className="project-plan" aria-label="Saved material plan">
                <div className="requirements-top">
                  <h3>Your Circular Material Plan</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setView('chat')
                      setAgentInitialPrompt('Review my saved materials and suggest DIY project assembly steps')
                    }}
                  >
                    Ask AI Architect for Assembly Guide
                  </Button>
                </div>
                <dl className="brief-facts">
                  <div>
                    <dt>Selected lots</dt>
                    <dd>{selectedItems.length}</dd>
                  </div>
                  <div>
                    <dt>Total Material Cost</dt>
                    <dd>0 ₹ (100% Free Community Gifts)</dd>
                  </div>
                  <div>
                    <dt>Known {requirements.category.toLowerCase()} area</dt>
                    <dd>{areaText(knownArea)}</dd>
                  </div>
                  <div>
                    <dt>Remaining area</dt>
                    <dd>
                      {!ready || projectArea === null
                        ? 'Set project dimensions'
                        : `${areaText(Math.max(0, projectArea - knownArea))}${
                            unknownArea ? ' + unknown coverage' : ''
                          }`}
                    </dd>
                  </div>
                </dl>
                <div className="selected-lots">
                  {selectedItems.map(x => (
                    <div key={x.id}>
                      <span>
                        {x.title}
                        <small>
                          {x.qty} {x.unit} · {x.locality} · Free Mindful Gift
                        </small>
                      </span>
                      <strong style={{ color: '#2F6B56' }}>0 ₹ (Free)</strong>
                      <button onClick={() => toggle(x.id)} aria-label={`Remove ${x.title} from project`}>
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Filter controls */}
            <div className="filters">
              <div className="categories">
                {CATEGORIES.map(x => (
                  <button
                    key={x}
                    aria-pressed={category === x}
                    className={category === x ? 'chosen' : ''}
                    onClick={() => setCategory(x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
              <div className="filter-options">
                <MapPin size={15} />
                <select aria-label="Filter by locality" value={locality} onChange={e => setLocality(e.target.value)}>
                  <option>All localities</option>
                  <option>Central District</option>
                  <option>North Zone</option>
                  <option>West End</option>
                  <option>South Suburbs</option>
                  <option>East River</option>
                </select>
                <SlidersHorizontal size={16} />
              </div>
            </div>

            {/* Empty state or Grid */}
            {shown.length === 0 ? (
              <div className="empty">
                <Search size={30} />
                <h3>
                  {view === 'project'
                    ? 'Your project starts with one good find.'
                    : view === 'mine'
                    ? 'Your leftovers could be someone’s starting point.'
                    : 'No surplus materials match these filters.'}
                </h3>
                <p>
                  {view === 'project'
                    ? 'Save a listing using the bookmark button or ask the assistant to search the demo inventory.'
                    : view === 'mine'
                    ? 'Create your first mindful giveaway in a couple of steps.'
                    : 'Try another category or choose all localities.'}
                </p>
                <Button
                  onClick={() => {
                    if (view === 'mine') {
                      beginList()
                      return
                    }
                    setCategory('All materials')
                    setLocality('All localities')
                    setSubmitted('')
                  }}
                >
                  {view === 'mine' ? 'List Leftovers' : 'Browse All Giveaways'}
                </Button>
              </div>
            ) : (
              <div className="material-grid">
                {shown.map(x => (
                  <article key={x.id} className="material-card">
                    <div className="art-wrap">
                      <button className="art-button" onClick={() => setSelected(x)} aria-label={`View ${x.title}`}>
                        <Material tone={x.tone} image={x.image} />
                      </button>
                      <span className="demo-tag">MINDFUL GIVEAWAY</span>
                      <button
                        className={'save ' + (saved.includes(x.id) ? 'saved' : '')}
                        onClick={() => toggle(x.id)}
                        aria-label={`${saved.includes(x.id) ? 'Unsave' : 'Save'} ${x.title}`}
                        aria-pressed={saved.includes(x.id)}
                      >
                        <Bookmark size={17} fill={saved.includes(x.id) ? 'currentColor' : 'none'} />
                      </button>
                      <span className="condition">{x.condition}</span>
                    </div>

                    <div className="material-meta">
                      <span>{x.category}</span>
                      <strong style={{ color: '#2F6B56' }}>
                        Free <small>to a good home</small>
                      </strong>
                    </div>

                    <button className="card-title" onClick={() => setSelected(x)}>
                      {x.title}
                      <ArrowUpRight size={17} />
                    </button>

                    <div className="card-bottom">
                      <span>{x.qty} {x.unit} available</span>
                      <span>
                        <MapPin size={12} />
                        {x.locality}
                      </span>
                    </div>

                    {/* Delivery simulation button */}
                    <button
                      className="claim-porter-btn"
                      onClick={() => handleClaimPorter(x)}
                      title="Preview a simulated low-emission delivery"
                    >
                      <Truck size={13} /> Preview Delivery
                    </button>

                    {x.own && (
                      <button
                        className="delete-link"
                        onClick={() => {
                          persist(items.filter(i => i.id !== x.id))
                          if (saved.includes(x.id)) toggle(x.id)
                          setNotice('Giveaway listing removed.')
                          void deleteListingFromFirestore(x.id).catch(err => {
                            console.warn('Could not delete listing from Firestore:', err)
                          })
                        }}
                      >
                        Remove my giveaway
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        {!isChat && (
          <footer>
            <span className="footer-brand">
              re:source <Leaf size={14} />
            </span>
            <span>
              Mindful Circular Resource Network · Not an eBay reseller · <span className="footer-credit">By Recursive Minds</span>
            </span>
            <span>Hyperlocal Circular Network · Green Logistics</span>
          </footer>
        )}
      </main>

      {createPortal(
        <>
          {mobileMoreOpen && (
            <button
              type="button"
              className="mobile-more-backdrop"
              aria-label="Close menu"
              onClick={() => setMobileMoreOpen(false)}
            />
          )}
          {mobileMoreOpen && (
            <div className="mobile-more-menu" role="menu" aria-label="More actions">
              <button type="button" role="menuitem" className={view === 'mine' ? 'active' : ''} onClick={() => goInventoryView('mine')}>
                <Gift size={16} />
                My gifts
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMobileMoreOpen(false)
                  setDeliveryOpen(true)
                }}
              >
                <Truck size={16} />
                Delivery demo
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMobileMoreOpen(false)
                  setRewardsOpen(true)
                }}
              >
                <Award size={16} />
                Rewards vault
              </button>
            </div>
          )}
          <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
            <button
              type="button"
              className={`mob-nav-btn ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setMobileMoreOpen(false)
                setView('dashboard')
                setCategory('All items')
              }}
            >
              <LayoutDashboard size={18} />
              <span>Home</span>
            </button>
            <button
              type="button"
              className={`mob-nav-btn ${isChat ? 'active' : ''}`}
              onClick={() => {
                setMobileMoreOpen(false)
                setView('chat')
                setCategory('All items')
              }}
            >
              <MessageSquareCode size={18} />
              <span>Chat</span>
            </button>
            <button
              type="button"
              className="mob-nav-btn mob-nav-btn-give"
              onClick={() => {
                setMobileMoreOpen(false)
                beginList()
              }}
            >
              <Plus size={18} />
              <span>Give</span>
            </button>
            <button
              type="button"
              className={`mob-nav-btn ${view === 'project' ? 'active' : ''}`}
              onClick={() => goInventoryView('project')}
            >
              <Bookmark size={18} />
              <span>Project{saved.length > 0 ? ` · ${saved.length}` : ''}</span>
            </button>
            <button
              type="button"
              className={`mob-nav-btn ${mobileMoreOpen || view === 'mine' ? 'active' : ''}`}
              aria-expanded={mobileMoreOpen}
              aria-haspopup="menu"
              onClick={() => setMobileMoreOpen(open => !open)}
            >
              <Ellipsis size={18} />
              <span>More</span>
            </button>
          </nav>
        </>,
        document.body
      )}

      {/* Item Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="detail-dialog">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              Mindful Giveaway · {selected?.locality} · 0 ₹ Free Community Reuse
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <Material tone={selected.tone} image={selected.image} />
              <div className="detail-stats">
                <span>{selected.qty} {selected.unit}</span>
                <strong style={{ color: '#2F6B56' }}>Free to a good home (+120 Karma to Donor)</strong>
              </div>
              <h3>What we know</h3>
              <p>{selected.detail}</p>
              <p>
                {selected.widthCm && selected.lengthCm
                  ? `Recorded demo dimensions: ${selected.widthCm} × ${selected.lengthCm} cm per piece.`
                  : 'Piece dimensions are unmeasured offcuts.'}
              </p>
                <h3>Delivery simulation</h3>
              <p>
                Preview a possible low-emission pickup flow. No driver or delivery partner is connected in this prototype.
              </p>
              <div className="detail-dialog-actions">
                <Button onClick={() => handleClaimPorter(selected)}>
                  <Truck size={16} /> Open Delivery Simulation
                </Button>
                <Button variant="outline" onClick={() => toggle(selected.id)}>
                  {saved.includes(selected.id) ? <Check size={16} /> : <Bookmark size={16} />}
                  {saved.includes(selected.id) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Porter Hyperlocal Delivery Tracking Modal */}
      <DeliveryTracker
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        delivery={activeDelivery}
        onAdvanceStage={newStage => {
          const updated = { ...activeDelivery, stage: newStage }
          setActiveDelivery(updated)
          localStorage.setItem('resource-active-delivery', JSON.stringify(updated))
        }}
        onAddKarma={addKarmaPoints}
      />

      {/* Circular Rewards & Karma Vault Modal */}
      <RewardsModal
        open={rewardsOpen}
        onOpenChange={setRewardsOpen}
        stats={rewardsStats}
        onRedeemPerk={(cost, _title) => {
          const remaining = Math.max(0, karma - cost)
          setKarma(remaining)
          localStorage.setItem('resource-karma', JSON.stringify(remaining))
        }}
      />

      {/* Reset Confirmation Dialog */}
      <Dialog open={reset} onOpenChange={setReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your demo workspace?</DialogTitle>
            <DialogDescription>
              This resets your saved materials, karma, active deliveries, and restores the initial mindful giveaways.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              persist(originals)
              setSaved([])
              setKarma(850)
              localStorage.removeItem('resource-saved')
              localStorage.removeItem('resource-karma')
              localStorage.removeItem('resource-active-delivery')
              localStorage.removeItem('resource-agent-conversations')
              localStorage.removeItem('resource-agent-active-id')
              setReset(false)
              setView('dashboard')
              setSubmitted('')
              setCategory('All materials')
              setLocality('All localities')
              setNotice('Demo workspace and Firestore catalog have been reset.')
              void reseedAllListings(originals).catch(err => {
                console.warn('Could not reseed Firestore listings:', err)
              })
            }}
          >
            Reset demo
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const MATERIAL_LABELS = [
  'Sea-glass ceramic mosaic tiles',
  'Solid pine timber offcuts',
  'Terracotta garden pots',
  'Warm sandstone patio pavers',
  'Brushed brass cabinet handles'
]

function Material({ tone, image }: { tone: number; image?: string }) {
  const safeTone = ((tone % 5) + 5) % 5
  const imgSrc = image || MATERIAL_IMAGES[safeTone]
  const label = MATERIAL_LABELS[safeTone]

  return (
    <div
      className={`material-art tone-${tone}`}
      aria-label={label}
      role="img"
    >
      <img
        src={imgSrc}
        alt={label}
        className="material-real-img"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none'
        }}
      />
      <div className="material-overlay-gradient" />
    </div>
  )
}

export default App
