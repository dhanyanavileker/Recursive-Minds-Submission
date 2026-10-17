import type { ProcurementOrder } from './types'

const LOCAL_STORAGE_KEY = 'resource-procured-orders-v1'

/**
 * Retrieve all background-negotiated orders
 */
export function getProcuredOrders(): ProcurementOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Error loading procured orders:', e)
  }
  return []
}

/**
 * Save or update a procured order
 */
export function saveProcuredOrder(order: ProcurementOrder): void {
  try {
    const existing = getProcuredOrders().filter(o => o.id !== order.id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([order, ...existing]))
  } catch (e) {
    console.error('Error saving procured order:', e)
  }
}

/**
 * Generate a tailored negotiation and procurement deal based on query
 */
export function createProcurementOrder({
  query,
  category = 'Timber',
  locality = 'Bengaluru',
  targetBudget = 400
}: {
  query: string
  category?: string
  locality?: string
  targetBudget?: number
}): ProcurementOrder {
  const q = query.toLowerCase()
  const orderId = `proc-${Date.now()}`

  let supplierName = 'Metro Demolition & Salvage Works'
  let supplierLocation = locality === 'All localities' ? 'Indiranagar Depot' : `${locality} Industrial Yard`
  let materialName = query.trim() || 'Reclaimed Heavy Timber Offcuts'
  let quantityDetails = '6–8 solid pieces (approx. 1.2–1.8m)'
  let originalPrice = Math.max(380, Math.round(targetBudget * 1.35))
  let negotiatedPrice = Math.max(200, Math.round(targetBudget * 0.95))
  let pickupWindow = 'Saturday, 10:00 AM – 1:00 PM'

  if (/tile|mosaic|slate|marble/i.test(q)) {
    category = 'Tiles'
    supplierName = 'Bangalore Tile Reclaim & Masonry'
    supplierLocation = 'HSR Layout Sector 2'
    materialName = q.includes('mosaic') ? 'Surplus Glazed Ceramic Mosaic Tiles' : 'Salvaged Floor Tile Lot'
    quantityDetails = 'Approx. 5.5 m² lot (clean uninstalled surplus)'
    originalPrice = 450
    negotiatedPrice = 340
    pickupWindow = 'Friday or Saturday, 11:00 AM – 3:00 PM'
  } else if (/pot|planter|terracotta|clay/i.test(q)) {
    category = 'Pots'
    supplierName = 'Pottery Town Demolition & Nursery Surplus'
    supplierLocation = 'Benson Town / Cantonment'
    materialName = 'Molded Terracotta Planters & Clay Shards'
    quantityDetails = '4 large garden pots + drainage shards'
    originalPrice = 320
    negotiatedPrice = 220
    pickupWindow = 'Sunday, 9:00 AM – 12:00 PM'
  } else if (/paver|stone|granite|brick/i.test(q)) {
    category = 'Pavers'
    supplierName = 'Deccan Stone & Paving Salvage'
    supplierLocation = 'Koramangala 4th Block'
    materialName = 'Dressed Granite & Sandstone Pavers'
    quantityDetails = '18 pieces (30 × 30 cm dressed pavers)'
    originalPrice = 520
    negotiatedPrice = 390
    pickupWindow = 'Saturday, 2:00 PM – 5:00 PM'
  } else if (/brass|handle|fitting|hinge|screw|metal/i.test(q)) {
    category = 'Fittings'
    supplierName = 'Heritage Architectural Hardware'
    supplierLocation = 'Shivajinagar Depot'
    materialName = 'Vintage Solid Brass Cabinet Fittings'
    quantityDetails = 'Matching set of 12 solid brass pulls'
    originalPrice = 380
    negotiatedPrice = 280
    pickupWindow = 'Any weekday, 10:00 AM – 6:00 PM'
  }

  const savedAmount = originalPrice - negotiatedPrice
  const discountPercent = Math.round((savedAmount / originalPrice) * 100)

  const negotiationTranscript = [
    {
      sender: 'agent' as const,
      text: `Connecting to ${supplierName} via automated circular-exchange broker. Inquiring regarding surplus material lot matching "${materialName}".`,
      timestamp: '10:00:12 AM'
    },
    {
      sender: 'supplier' as const,
      text: `Lot identified from commercial remodel project. Verified sound condition. Standard asking price is ₹${originalPrice} for the full lot.`,
      timestamp: '10:00:24 AM'
    },
    {
      sender: 'agent' as const,
      text: `Buyer profile verified through Re:Source. Requesting circular discount based on verified pickup within 48h. Counter-offering ₹${Math.round(negotiatedPrice * 0.9)} cash-on-pickup.`,
      timestamp: '10:00:39 AM',
      highlight: true
    },
    {
      sender: 'supplier' as const,
      text: `We can accept ₹${negotiatedPrice} if collected during our weekend transfer window (${pickupWindow}).`,
      timestamp: '10:00:58 AM'
    },
    {
      sender: 'agent' as const,
      text: `Terms accepted: Price ₹${negotiatedPrice} (saved ₹${savedAmount} / ${discountPercent}% discount). Temporary lot hold placed for user confirmation. Gate pass generated.`,
      timestamp: '10:01:10 AM',
      highlight: true
    }
  ]

  const order: ProcurementOrder = {
    id: orderId,
    materialQuery: query,
    category,
    locality,
    targetBudget,
    supplierName,
    supplierLocation,
    originalPrice,
    negotiatedPrice,
    savedAmount,
    discountPercent,
    pickupWindow,
    quantityDetails,
    status: 'scouting',
    progressStage: 1,
    negotiationTranscript,
    createdAt: Date.now()
  }

  saveProcuredOrder(order)
  return order
}
