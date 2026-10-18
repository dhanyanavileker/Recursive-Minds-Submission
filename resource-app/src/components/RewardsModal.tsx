import { useState } from 'react'
import {
  Award,
  Sparkles,
  Leaf,
  Gift,
  CheckCircle2,
  Lock,
  Truck,
  Check
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface RewardsStats {
  karma: number
  wasteDivertedKg: number
  co2SavedKg: number
  giveawaysCount: number
  buildsCount: number
}

interface RewardsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stats: RewardsStats
  onRedeemPerk?: (cost: number, perkName: string) => void
}

export function RewardsModal({
  open,
  onOpenChange,
  stats,
  onRedeemPerk
}: RewardsModalProps) {
  const [redeemed, setRedeemed] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState('')

  const badges = [
    {
      id: 'zero-waste',
      title: 'Zero Waste Champion',
      desc: 'Diverted > 50 kg surplus material from municipal landfills.',
      icon: '♻️',
      unlocked: stats.wasteDivertedKg >= 50
    },
    {
      id: 'mindful-giver',
      title: 'Mindful Gifter',
      desc: 'Donated 3+ leftover lots to fellow Bengaluru makers.',
      icon: '🎁',
      unlocked: stats.giveawaysCount >= 3
    },
    {
      id: 'ai-architect',
      title: 'Circular Architect',
      desc: 'Designed 2+ upcycling projects using the AI Copilot.',
      icon: '🔨',
      unlocked: stats.buildsCount >= 2
    },
    {
      id: 'green-mover',
      title: 'Green Logistics Champion',
      desc: 'Consolidated materials using hyperlocal low-emission EV routing.',
      icon: '🚚',
      unlocked: true
    }
  ]

  const perks = [
    {
      id: 'sustainable-delivery-credit',
      title: '₹200 Sustainable Delivery Credit',
      desc: 'Applies automatically to your next low-emission resource pickup.',
      cost: 300,
      icon: Truck
    },
    {
      id: 'seed-bombs',
      title: 'Native Wildflower & Herb Seed Kit',
      desc: 'Complimentary home-delivered seed bombs for balcony planters.',
      cost: 400,
      icon: Leaf
    },
    {
      id: 'hardware-voucher',
      title: '15% Off Upcycling Tools & Sealants',
      desc: 'Redeemable at participating Bengaluru hardware partner stores.',
      cost: 500,
      icon: Gift
    }
  ]

  const handleRedeem = (perk: typeof perks[0]) => {
    if (stats.karma < perk.cost) {
      setMessage(`You need ${perk.cost - stats.karma} more Karma to claim this reward.`)
      setTimeout(() => setMessage(''), 3000)
      return
    }
    setRedeemed(prev => ({ ...prev, [perk.id]: true }))
    if (onRedeemPerk) onRedeemPerk(perk.cost, perk.title)
    setMessage(`🎉 Claimed "${perk.title}"! Voucher code: CIRCULAR-${Math.floor(1000 + Math.random() * 9000)}`)
    setTimeout(() => setMessage(''), 5000)
  }

  // Tier calculation
  const nextTierGoal = 1000
  const progressPercent = Math.min(100, Math.round((stats.karma / nextTierGoal) * 100))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rewards-modal">
        <DialogHeader>
          <div className="rewards-badge-header">
            <span className="trophy-pill">
              <Award size={15} /> CIRCULAR REWARDS VAULT
            </span>
          </div>
          <DialogTitle className="rewards-title">
            Your Community Karma & Environmental Impact
          </DialogTitle>
          <DialogDescription className="rewards-desc">
            Earn rewards every time you mindfully give away leftovers or rescue materials before they reach landfills.
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div className="rewards-notification">
            <Sparkles size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Tier Card */}
        <div className="tier-card">
          <div className="tier-header">
            <div>
              <span className="tier-sub">CURRENT COMMUNITY STANDING</span>
              <h3 className="tier-name">Tier 3: Master Circular Steward</h3>
            </div>
            <div className="karma-bubble">
              <strong>{stats.karma}</strong>
              <small>KARMA PTS</small>
            </div>
          </div>

          <div className="tier-progress-wrap">
            <div className="progress-labels">
              <span>Level 3</span>
              <span>{stats.karma} / {nextTierGoal} Karma to Eco-Pioneer</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Impact Metrics */}
        <div className="rewards-metrics-grid">
          <div className="metric-box">
            <span className="metric-num">♻️ {stats.wasteDivertedKg} kg</span>
            <span className="metric-tag">Landfill Waste Diverted</span>
          </div>
          <div className="metric-box">
            <span className="metric-num">🌿 {stats.co2SavedKg} kg</span>
            <span className="metric-tag">CO₂ Offset (Lifecycle)</span>
          </div>
          <div className="metric-box">
            <span className="metric-num">🎁 {stats.giveawaysCount}</span>
            <span className="metric-tag">Mindful Giveaways</span>
          </div>
          <div className="metric-box">
            <span className="metric-num">🔨 {stats.buildsCount}</span>
            <span className="metric-tag">AI Builds Crafted</span>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="badges-section">
          <h4>CIRCULAR COMMUNITY BADGES</h4>
          <div className="badges-grid">
            {badges.map(b => (
              <div key={b.id} className={`badge-card ${b.unlocked ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon-wrap">
                  <span className="badge-emoji">{b.icon}</span>
                  {b.unlocked ? (
                    <CheckCircle2 size={13} className="badge-check" />
                  ) : (
                    <Lock size={13} className="badge-lock" />
                  )}
                </div>
                <strong>{b.title}</strong>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Redeemable Perks */}
        <div className="perks-section">
          <h4>REDEEMABLE ECO PERKS</h4>
          <div className="perks-list">
            {perks.map(p => {
              const isClaimed = redeemed[p.id]
              const Icon = p.icon
              return (
                <div key={p.id} className="perk-row">
                  <div className="perk-icon">
                    <Icon size={18} />
                  </div>
                  <div className="perk-info">
                    <strong>{p.title}</strong>
                    <p>{p.desc}</p>
                  </div>
                  <div className="perk-action">
                    <Button
                      size="sm"
                      variant={isClaimed ? 'outline' : 'default'}
                      disabled={isClaimed}
                      onClick={() => handleRedeem(p)}
                      className={isClaimed ? 'claimed-btn' : 'claim-btn'}
                    >
                      {isClaimed ? (
                        <>
                          <Check size={14} /> Claimed
                        </>
                      ) : (
                        `${p.cost} Karma`
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* How to Earn Strip */}
        <div className="how-to-earn-card">
          <h4>⚡ HOW TO EARN MORE KARMA</h4>
          <div className="earn-rules-grid">
            <div>
              <strong>+150 Karma</strong>
              <span>Give away surplus materials</span>
            </div>
            <div>
              <strong>+80 Karma</strong>
              <span>Rescue a community lot</span>
            </div>
            <div>
              <strong>+100 Karma</strong>
              <span>Build project with AI Copilot</span>
            </div>
            <div>
              <strong>+50 Karma</strong>
              <span>Handover via Green Logistics Network</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
