import { useState } from 'react'
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
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import './App.css'
import { blankRequirements, listingArea, targetArea, areaText } from './matching'
import type { Requirements } from './matching'
import { useAuth } from './AuthContext'
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
}

const MATERIAL_IMAGES = [
  '/images/materials/tiles.jpg',
  '/images/materials/timber.jpg',
  '/images/materials/pots.jpg',
  '/images/materials/pavers.jpg',
  '/images/materials/fittings.jpg',
]

const originals: Listing[] = Array.from({ length: 20 }, (_, i) => {
  const types = [
    ['Sea-glass mosaic tiles', 'Tiles', 'pieces', 'Ceramic leftover tile lot from kitchen splashback. Mindfully gifted to prevent landfill waste. Confirm dimensions and finish before use.'],
    ['Solid pine offcuts', 'Timber', 'pieces', 'Clean untreated pine offcuts, approximately 40–60 cm long. Perfect for small shelves or planters.'],
    ['Terracotta garden pots', 'Pots', 'pots', 'Small terracotta pots with drainage holes. Free to a good home for terrace garden upcycling.'],
    ['Warm sandstone pavers', 'Pavers', 'pavers', 'Approximately 30 × 30 cm each. Leftover patio pavers, sturdy and ready for stepping stones.'],
    ['Brushed brass handles', 'Fittings', 'handles', 'Matching cabinet handles surplus from wardrobe makeover. Clean and ready to install.']
  ][i % 5]
  return {
    id: i + 1,
    title: types[0] + (i >= 5 ? ` · batch ${Math.floor(i / 5) + 1}` : ''),
    category: types[1],
    unit: types[2],
    detail: types[3],
    widthCm: i % 5 === 0 && i !== 15 ? (i === 10 ? 5 : 10) : undefined,
    lengthCm: i % 5 === 0 && i !== 15 ? (i === 10 ? 5 : 10) : undefined,
    qty: [48, 12, 6, 18, 8][i % 5],
    price: 0, // All mindful giveaways are 100% free community gifts!
    locality: i % 3 === 0 ? 'Indiranagar' : i % 3 === 1 ? 'Koramangala' : 'HSR Layout',
    condition: i % 4 === 0 ? 'Unused surplus' : 'Previously used',
    tone: i % 5,
    image: MATERIAL_IMAGES[i % 5]
  }
})

const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function App() {
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
  const [items, setItems] = useState<Listing[]>(() => load('resource-items-v2', originals))
  const [saved, setSaved] = useState<number[]>(() => load('resource-saved', []))

  // View modes: 'dashboard' | 'chat' | 'project' | 'mine' | 'list'
  const [view, setView] = useState<string>('dashboard')
  const [category, setCategory] = useState('All materials')
  const [locality, setLocality] = useState('All localities')
  const [free, setFree] = useState(false)
  const [submitted, setSubmitted] = useState<string>(() => load('resource-request', ''))
  const [selected, setSelected] = useState<Listing | null>(null)
  const [notice, setNotice] = useState('')
  const [reset, setReset] = useState(false)

  // Listing creation form state
  const [step, setStep] = useState(0)
  const [sample, setSample] = useState(false)
  const [photo, setPhoto] = useState('')
  const [title, setTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Tiles')
  const [quantity, setQuantity] = useState('')
  const [newLocality, setNewLocality] = useState('Indiranagar')
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

  // Third-Party Logistics (Porter Tracking) state
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [activeDelivery, setActiveDelivery] = useState<DeliveryDetails>(() => load('resource-active-delivery', DEFAULT_DELIVERY))

  // AI Chat direct prompt trigger
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string | null>(null)

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
    localStorage.setItem('resource-items-v2', JSON.stringify(next))
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
  const inferred = /tile|mosaic/.test(q)
    ? 'Tiles'
    : /wood|timber|pine|bench|seat|stool|shelf|bookcase|desk|table/.test(q)
    ? 'Timber'
    : /pot|plant/.test(q)
    ? 'Pots'
    : /paver|paving/.test(q)
    ? 'Pavers'
    : /handle|fitting/.test(q)
    ? 'Fittings'
    : ''

  const shown = items.filter(
    x =>
      (view === 'project' ? saved.includes(x.id) : view === 'mine' ? x.own : true) &&
      (category === 'All materials' || x.category === category) &&
      (locality === 'All localities' || x.locality === locality) &&
      (!free || x.price === 0) &&
      ((!submitted && !ready) ||
        view !== 'dashboard' ||
        (ready
          ? x.category === requirements.category &&
            (requirements.locality === 'All localities' || x.locality === requirements.locality) &&
            (requirements.budget === '' || x.price <= Number(requirements.budget))
          : inferred
          ? x.category === inferred
          : (x.title + ' ' + x.category + ' ' + x.detail).toLowerCase().includes(q)))
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
    const item: Listing = {
      id: Date.now(),
      title: title.trim(),
      category: newCategory,
      qty: Number(quantity),
      unit: newCategory === 'Pots' ? 'pots' : 'pieces',
      price: 0, // Mindful giveaway
      locality: newLocality,
      condition,
      widthCm: newWidth ? Number(newWidth) : undefined,
      lengthCm: newLength ? Number(newLength) : undefined,
      detail: `Mindfully gifted by community donor. Pickup window: ${pickupWindow.trim() || 'Flexible community pickup'}. Verified zero-waste circular giveaway.`,
      tone: ['Tiles', 'Timber', 'Pots', 'Pavers', 'Fittings'].indexOf(newCategory),
      image: photo || MATERIAL_IMAGES[Math.max(0, ['Tiles', 'Timber', 'Pots', 'Pavers', 'Fittings'].indexOf(newCategory))],
      own: true
    }
    persist([item, ...items])
    addKarmaPoints(150)
    setView('mine')
    setLocality('All localities')
    setFree(false)
    setCategory('All materials')
    setSubmitted('')
    setNotice('🎉 Mindful giveaway published! +150 Circular Karma awarded to your account.')
  }

  // Trigger Porter Delivery Tracking for an item
  const handleClaimPorter = (item: Listing) => {
    const updatedDelivery: DeliveryDetails = {
      ...DEFAULT_DELIVERY,
      id: `PRTR-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
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
    setNotice(`🚚 Porter Hyperlocal Delivery scheduled for "${item.title}". Tracking is live!`)
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
              title="Open Circular Rewards Vault"
            >
              <Award size={14} />
              <span>{karma} Karma</span>
            </button>

            {/* Porter Delivery Tracker Pill */}
            <button
              className="porter-header-pill"
              onClick={() => setDeliveryOpen(true)}
              title="Track Active Porter Delivery"
            >
              <span className="pulsing-dot" />
              <Truck size={14} />
              <span>Porter Live</span>
            </button>
          </div>

          <Button onClick={beginList} className="list-button">
            <Plus size={16} /> Give Leftovers
          </Button>

          {user && (
            <div className="user-menu">
              <img
                className="user-avatar"
                src={user.photoURL || ''}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
              />
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
          <span className="status-dot" /> Re:Source Circular Network · Mindfully giving away leftovers across Bengaluru
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
                      setTitle('Sea-glass mosaic tiles')
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
                    <p>Earn +150 Karma upon publication to redeem for Porter delivery credits.</p>
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
                        {['Tiles', 'Timber', 'Pots', 'Pavers', 'Fittings'].map(x => (
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
                        {['Indiranagar', 'Koramangala', 'HSR Layout'].map(x => (
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
                      placeholder="e.g. Saturday, 10 am–1 pm or Porter doorstep pickup"
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
                    <Leaf size={14} /> NOT RESELLING · MINDFUL CIRCULAR GIVEAWAYS
                  </div>
                  <h1>
                    Mindfully give away<br />
                    <span>what you no longer use.</span>
                  </h1>
                  <p className="hero-tagline">
                    It's not eBay or commercial commerce. Re:Source connects people with leftover renovation materials to local builders, makers, and DIYers — 100% free circular reuse, community rewards, and tracked to your door via Porter.
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
                        Have leftover tiles, timber offcuts, pots, or paint? Post a mindful giveaway in 30 seconds to give them a second life.
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
                        Searching for materials for a DIY, garden, or repair project? Claim community surplus nearby for free before it reaches landfills.
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
                        Tell AI what you want to build. It auto-generates the blueprint, lists required parts, and matches available leftovers!
                      </p>
                      <div className="build-chips-list">
                        <button
                          type="button"
                          className="build-chip-btn"
                          onClick={() => handleBuildPrompt('I want to build a garden planter box using surplus materials')}
                        >
                          Balcony Planter
                        </button>
                        <button
                          type="button"
                          className="build-chip-btn"
                          onClick={() => handleBuildPrompt('How can I make mosaic stepping stones with leftover tiles?')}
                        >
                          Mosaic Stepping Stones
                        </button>
                        <button
                          type="button"
                          className="build-chip-btn"
                          onClick={() => handleBuildPrompt('I want to build a reclaimed wood coffee table')}
                        >
                          Wood Coffee Table
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
                        <Leaf size={20} style={{ color: '#2F6B56' }} />
                        <div>
                          <strong>64.5 kg Diverted</strong>
                          <span>Landfill Waste Prevented</span>
                        </div>
                      </div>
                      <div className="impact-stat-item">
                        <ShieldCheck size={20} style={{ color: '#25d9f0' }} />
                        <div>
                          <strong>42.0 kg CO₂e</strong>
                          <span>Emissions Avoided</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Porter Logistics Banner */}
                    <button
                      type="button"
                      className="active-porter-strip"
                      onClick={() => setDeliveryOpen(true)}
                      title="Click to track live delivery"
                    >
                      <span className="pulsing-dot" />
                      <Truck size={16} />
                      <span>Porter Mini-Truck in transit (ETA ~14 mins)</span>
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
                    ? 'Materials saved for your upcoming circular project. Compare dimensions and book a Porter pickup.'
                    : view === 'mine'
                    ? 'Materials you are mindfully giving away to fellow builders.'
                    : 'Surplus materials freely gifted by Bengaluru community members to prevent landfill waste.'}
                </p>
              </div>
              {view === 'project' && saved.length > 0 && (
                <Button onClick={() => setDeliveryOpen(true)}>
                  Book Porter Hyperlocal Delivery <ArrowUpRight size={16} />
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
                {['All materials', 'Tiles', 'Timber', 'Pots', 'Pavers', 'Fittings'].map(x => (
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
                  <option>Indiranagar</option>
                  <option>Koramangala</option>
                  <option>HSR Layout</option>
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
                    ? 'Save a material using the bookmark button or ask AI to scout demolition yards.'
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

                    {/* Claim & Porter Delivery Button */}
                    <button
                      className="claim-porter-btn"
                      onClick={() => handleClaimPorter(x)}
                      title="Claim this material and schedule Porter Hyperlocal delivery"
                    >
                      <Truck size={13} /> Claim & Track via Porter
                    </button>

                    {x.own && (
                      <button
                        className="delete-link"
                        onClick={() => {
                          persist(items.filter(i => i.id !== x.id))
                          if (saved.includes(x.id)) toggle(x.id)
                          setNotice('Giveaway listing removed.')
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
            <span>Bengaluru Hyperlocal Pilot · Logistics by Porter</span>
          </footer>
        )}
      </main>

      {/* Mobile-First Sticky Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          className={`mob-nav-btn ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setView('dashboard')
            setCategory('All materials')
          }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <button
          className={`mob-nav-btn ${isChat ? 'active' : ''}`}
          onClick={() => {
            setView('chat')
            setCategory('All materials')
          }}
        >
          <MessageSquareCode size={18} />
          <span>AI Chat</span>
        </button>
        <button className="mob-nav-btn" onClick={beginList}>
          <Plus size={18} />
          <span>Give</span>
        </button>
        <button className="mob-nav-btn" onClick={() => setDeliveryOpen(true)}>
          <Truck size={18} />
          <span>Track</span>
        </button>
        <button className="mob-nav-btn" onClick={() => setRewardsOpen(true)}>
          <Award size={18} />
          <span>Rewards</span>
        </button>
      </nav>

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
              <h3>Delivery & Verification</h3>
              <p>
                Hyperlocal pickup via Porter EV mini-truck available across Bengaluru. Drivers verify items before loading.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <Button onClick={() => handleClaimPorter(selected)} style={{ flex: 1 }}>
                  <Truck size={16} /> Claim & Book Porter Delivery
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
              setNotice('Demo workspace has been reset.')
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
