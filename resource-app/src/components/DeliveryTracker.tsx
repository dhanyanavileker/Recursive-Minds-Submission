import { useState, useEffect } from 'react'
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Navigation,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface DeliveryDetails {
  id: string
  itemName: string
  category: string
  quantity: string
  donorLocality: string
  recipientLocality: string
  stage: number // 0: Matched, 1: Driver Assigned, 2: Picked Up, 3: In Transit, 4: Delivered
  driverName: string
  driverPhone: string
  vehicleModel: string
  vehicleNumber: string
  rating: number
  trips: number
  otp: string
  etaMinutes: number
  co2SavedKg: number
  wasteDivertedKg: number
}

export const DEFAULT_DELIVERY: DeliveryDetails = {
  id: 'ECO-DEL-8924',
  itemName: 'Sea-glass mosaic ceramic tiles (48 pieces)',
  category: 'Materials',
  quantity: '48 pieces · 1 lot',
  donorLocality: '12th Ave, Central District',
  recipientLocality: 'West End Hub / Maker Site',
  stage: 3, // In Transit
  driverName: 'Ramesh Kumar',
  driverPhone: '+91 98450 23149',
  vehicleModel: 'Eco EV 3-Wheeler Mini-Truck',
  vehicleNumber: 'EV-ECO-4821',
  rating: 4.9,
  trips: 1840,
  otp: '7419',
  etaMinutes: 14,
  co2SavedKg: 14.2,
  wasteDivertedKg: 24.0
}

interface DeliveryTrackerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  delivery?: DeliveryDetails
  onAdvanceStage?: (newStage: number) => void
  onAddKarma?: (amount: number) => void
}

export function DeliveryTracker({
  open,
  onOpenChange,
  delivery = DEFAULT_DELIVERY,
  onAdvanceStage,
  onAddKarma
}: DeliveryTrackerProps) {
  const [currentStage, setCurrentStage] = useState<number>(delivery.stage)
  const [eta, setEta] = useState<number>(delivery.etaMinutes)
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [alertNotice, setAlertNotice] = useState<string>('')

  // Sync with prop when opened
  useEffect(() => {
    setCurrentStage(delivery.stage)
    setEta(delivery.etaMinutes)
  }, [delivery.stage, delivery.etaMinutes, open])

  const stages = [
    {
      title: 'Mindful Giveaway Matched',
      desc: 'Donor approved giveaway request. Materials packed & ready.',
      time: '12:30 PM',
      done: currentStage >= 0
    },
    {
      title: 'Green Logistics Partner Assigned',
      desc: `The demo assigns ${delivery.driverName} and ${delivery.vehicleModel}.`,
      time: '12:35 PM',
      done: currentStage >= 1
    },
    {
      title: 'Picked up from Donor Site',
      desc: `Simulated collection from ${delivery.donorLocality}.`,
      time: '12:50 PM',
      done: currentStage >= 2
    },
    {
      title: 'In Transit to Destination',
      desc: `En route heading to ${delivery.recipientLocality}.`,
      time: '01:05 PM',
      done: currentStage >= 3
    },
    {
      title: 'Delivered & Handover Confirmed',
      desc: `Simulated arrival and handover confirmation.`,
      time: currentStage === 4 ? '01:22 PM' : 'Est. 01:25 PM',
      done: currentStage >= 4
    }
  ]

  const handleNextStage = () => {
    if (currentStage < 4) {
      const next = currentStage + 1
      setCurrentStage(next)
      if (onAdvanceStage) onAdvanceStage(next)
      if (next === 4) {
        setAlertNotice('Simulation complete. No real delivery or reward was created.')
        if (onAddKarma) onAddKarma(50)
      } else if (next === 3) {
        setEta(8)
      }
    }
  }

  const handleReset = () => {
    setCurrentStage(1)
    setEta(18)
    if (onAdvanceStage) onAdvanceStage(1)
    setAlertNotice('')
  }

  const copyPin = () => {
    navigator.clipboard?.writeText(delivery.otp)
    setCopiedOtp(true)
    setTimeout(() => setCopiedOtp(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="delivery-modal">
        <DialogHeader>
          <div className="porter-header-brand">
            <span className="porter-badge">
              <Truck size={15} /> SIMULATED DELIVERY DEMO
            </span>
            <span className="live-pill">
              <span className="live-dot" /> PROTOTYPE
            </span>
          </div>
          <DialogTitle className="delivery-title">
            Tracking Circular Delivery #{delivery.id}
          </DialogTitle>
          <DialogDescription className="delivery-desc">
            Illustrative logistics flow. No driver, vehicle, route, or delivery is active.
          </DialogDescription>
        </DialogHeader>

        {alertNotice && (
          <div className="delivery-alert">
            <Sparkles size={16} />
            <span>{alertNotice}</span>
          </div>
        )}

        {/* Item & Route Card */}
        <div className="delivery-route-card">
          <div className="item-summary-row">
            <div>
              <span className="route-label">MATERIAL IN TRANSIT</span>
              <h4 className="item-name">{delivery.itemName}</h4>
            </div>
            <div className="eta-badge">
              <Clock size={14} />
              <span>{currentStage === 4 ? 'Delivered' : `ETA: ~${eta} mins`}</span>
            </div>
          </div>

          <div className="locations-flow">
            <div className="loc-point">
              <div className="loc-icon donor">
                <MapPin size={14} />
              </div>
              <div className="loc-text">
                <small>PICKUP FROM DONOR</small>
                <strong>{delivery.donorLocality}</strong>
              </div>
            </div>
            <div className="loc-connector">
              <span className="connector-line" />
              <Truck size={14} className="transit-truck-icon" />
            </div>
            <div className="loc-point">
              <div className="loc-icon recipient">
                <Navigation size={14} />
              </div>
              <div className="loc-text">
                <small>DROP AT PROJECT SITE</small>
                <strong>{delivery.recipientLocality}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Visualizer */}
        <div className="simulated-map-container">
          <svg className="route-svg" viewBox="0 0 600 120" preserveAspectRatio="none">
            {/* Background road */}
            <path
              d="M 40 60 Q 180 15, 300 65 T 560 60"
              fill="none"
              stroke="#1f3442"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active route path */}
            <path
              d="M 40 60 Q 180 15, 300 65 T 560 60"
              fill="none"
              stroke="#25d9f0"
              strokeWidth="4"
              strokeDasharray="8 4"
              className="active-route-line"
            />
            {/* Pickup Node */}
            <circle cx="40" cy="60" r="10" fill="#143c33" stroke="#34d399" strokeWidth="3" />
            {/* Moving Vehicle Node */}
            <g
              transform={`translate(${
                currentStage === 0
                  ? 40
                  : currentStage === 1
                  ? 120
                  : currentStage === 2
                  ? 200
                  : currentStage === 3
                  ? 380
                  : 560
              }, ${currentStage === 3 ? 55 : 60})`}
              className="moving-vehicle-node"
            >
              <circle cx="0" cy="0" r="14" fill="#25d9f0" className="pulse-circle" />
              <circle cx="0" cy="0" r="8" fill="#080d12" />
            </g>
            {/* Drop Node */}
            <circle cx="560" cy="60" r="10" fill="#3b2020" stroke="#f87171" strokeWidth="3" />
          </svg>
          <div className="map-labels">
            <span>Central Hub</span>
            <span className="live-vehicle-tag">
              {currentStage === 4 ? '📍 Arrived at Destination' : '🚚 Low-emission EV in transit (3.2 km away)'}
            </span>
            <span>West End Site</span>
          </div>
        </div>

        {/* Driver & Partner Details */}
        <div className="driver-card">
          <div className="driver-avatar-wrap">
            <div className="driver-avatar">RK</div>
            <div className="verified-badge">
              <ShieldCheck size={12} />
            </div>
          </div>
          <div className="driver-info">
            <div className="driver-name-row">
              <strong>{delivery.driverName}</strong>
              <span className="driver-rating">★ {delivery.rating} ({delivery.trips} trips)</span>
            </div>
            <span className="vehicle-details">
              {delivery.vehicleModel} · <span className="plate-pill">{delivery.vehicleNumber}</span>
            </span>
          </div>
          <div className="driver-actions"><span className="plate-pill">Demo profile</span></div>
        </div>

        {/* Handover OTP Box */}
        <div className="otp-container">
          <div className="otp-text">
            <span>DEMO HANDOVER PIN</span>
            <p>Illustrates a future verified handover. This PIN is not active.</p>
          </div>
          <button className="otp-display" onClick={copyPin} title="Click to copy">
            <strong>{delivery.otp}</strong>
            <small>{copiedOtp ? 'Copied!' : 'Click to copy'}</small>
          </button>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="milestones-timeline">
          <div className="timeline-header">
            <span>DELIVERY MILESTONES</span>
            <span className="stage-count">Stage {currentStage + 1} of 5</span>
          </div>
          <div className="timeline-list">
            {stages.map((st, idx) => (
              <div
                key={st.title}
                className={`timeline-item ${st.done ? 'done' : ''} ${
                  currentStage === idx ? 'current' : ''
                }`}
              >
                <div className="timeline-node">
                  {st.done ? <CheckCircle2 size={16} /> : <div className="pending-dot" />}
                </div>
                <div className="timeline-content">
                  <div className="timeline-title-row">
                    <strong>{st.title}</strong>
                    <span className="timeline-time">{st.time}</span>
                  </div>
                  <p>{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Impact Metrics */}
        <div className="logistics-impact-strip">
          <div className="impact-col">
            <span className="impact-val">🌱 {delivery.co2SavedKg} kg</span>
            <span className="impact-lbl">Illustrative CO₂e estimate · unverified</span>
          </div>
          <div className="impact-divider" />
          <div className="impact-col">
            <span className="impact-val">♻️ {delivery.wasteDivertedKg} kg</span>
            <span className="impact-lbl">Illustrative diversion estimate · unverified</span>
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div className="sim-controls">
          {currentStage < 4 ? (
            <Button onClick={handleNextStage} className="advance-sim-btn">
              <Sparkles size={16} /> Advance Delivery Milestone (Simulation)
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline" className="reset-sim-btn">
              <RefreshCw size={14} /> Restart Tracking Simulation
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
