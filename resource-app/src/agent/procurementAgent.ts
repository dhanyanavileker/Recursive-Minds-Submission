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
  locality = 'Local Area'
}: {
  query: string
  category?: string
  locality?: string
  targetBudget?: number
}): ProcurementOrder {
  const q = query.toLowerCase()
  const orderId = `proc-${Date.now()}`

  let supplierName = 'Community Circular Resource Exchange'
  let supplierLocation = locality === 'All localities' ? 'Central Resource Depot' : `${locality} Community Hub`
  let materialName = query.trim() || 'Surplus Usable Resources'
  let quantityDetails = 'Clean, usable surplus community items'
  let landfillDiversionKg = 75
  let carbonSavedKg = 50
  let pickupWindow = 'Saturday, 10:00 AM – 2:00 PM'

  if (/chair|table|desk|shelf|furniture|bench|stool|sofa|wood/i.test(q)) {
    category = 'Furniture'
    supplierName = 'Civic Furniture Rescue & Upcycling Hub'
    supplierLocation = locality === 'All localities' ? 'Central Maker Depot' : `${locality} Maker Hub`
    materialName = q.includes('table') ? 'Solid Wood Side Table & Clean Offcuts' : 'Modular Office / Home Furniture'
    quantityDetails = 'Clean, sturdy pre-loved furniture lot'
    landfillDiversionKg = 110
    carbonSavedKg = 75
    pickupWindow = 'Saturday, 11:00 AM – 3:00 PM'
  } else if (/monitor|screen|display|cable|laptop|phone|tech|electron|cord|charger|fitting|power/i.test(q)) {
    category = 'Electronic Items'
    supplierName = 'City Tech Reclaim & E-Waste Collective'
    supplierLocation = locality === 'All localities' ? 'Innovation District Hub' : `${locality} Tech Depot`
    materialName = q.includes('monitor') ? 'Tested USB-C Display & Power Adapter' : 'Surplus Working Electronics Lot'
    quantityDetails = 'Clean, tested electronics with accessories'
    landfillDiversionKg = 45
    carbonSavedKg = 90
    pickupWindow = 'Thursday or Friday, 10:00 AM – 4:00 PM'
  } else if (/tile|mosaic|slate|marble/i.test(q)) {
    category = 'Construction Materials'
    supplierName = 'City Tile Reclaim & Material Exchange'
    supplierLocation = 'East District Hub'
    materialName = q.includes('mosaic') ? 'Surplus Glazed Ceramic Mosaic Tiles' : 'Remodel Surplus Floor Tile Lot'
    quantityDetails = 'Approx. 5.5 m² lot (clean uninstalled surplus)'
    landfillDiversionKg = 95
    carbonSavedKg = 60
    pickupWindow = 'Friday or Saturday, 11:00 AM – 3:00 PM'
  } else if (/lumber|timber|pine|plank|beam|construct/i.test(q)) {
    category = 'Construction Materials'
    supplierName = 'Architectural Timber & Wood Reclaim'
    supplierLocation = 'Central Reclamation Depot'
    materialName = 'Clean Untreated Lumber & Wood Offcuts'
    quantityDetails = '8 solid lumber offcuts (approx. 40–80 cm)'
    landfillDiversionKg = 130
    carbonSavedKg = 85
    pickupWindow = 'Saturday, 9:00 AM – 1:00 PM'
  } else if (/pot|planter|terracotta|clay/i.test(q)) {
    category = 'Household Items'
    supplierName = 'Metropolitan Community Garden Surplus'
    supplierLocation = 'North Side Depot'
    materialName = 'Terracotta Planters & Clay Drainage Trays'
    quantityDetails = '4 large garden pots + drainage trays'
    landfillDiversionKg = 60
    carbonSavedKg = 35
    pickupWindow = 'Sunday, 9:00 AM – 12:00 PM'
  } else if (/paver|stone|granite|brick/i.test(q)) {
    category = 'Construction Materials'
    supplierName = 'Civic Stone & Paving Exchange'
    supplierLocation = 'South Yard Hub'
    materialName = 'Dressed Granite & Sandstone Pavers'
    quantityDetails = '18 pieces (30 × 30 cm dressed pavers)'
    landfillDiversionKg = 210
    carbonSavedKg = 130
    pickupWindow = 'Saturday, 2:00 PM – 5:00 PM'
  }

  const negotiationTranscript = [
    {
      sender: 'agent' as const,
      text: `Simulation: a future sourcing agent could contact ${supplierName} about a surplus lot matching "${materialName}".`,
      timestamp: '10:00:12 AM'
    },
    {
      sender: 'supplier' as const,
      text: `Illustrative supplier response: a suitable surplus lot may be available, subject to inspection and owner confirmation.`,
      timestamp: '10:00:24 AM'
    },
    {
      sender: 'agent' as const,
      text: `Illustrative request: ask whether the owner would consider a zero-cost community transfer instead of disposal. No reuse outcome is verified.`,
      timestamp: '10:00:39 AM',
      highlight: true
    },
    {
      sender: 'supplier' as const,
      text: `Illustrative supplier response: the owner could offer the lot for 0 ₹ during a proposed transfer window (${pickupWindow}), subject to confirmation.`,
      timestamp: '10:00:58 AM'
    },
    {
      sender: 'agent' as const,
      text: `Simulation complete: show the proposed handover terms for user review. No hold, voucher, reservation, or supplier contact was created.`,
      timestamp: '10:01:10 AM',
      highlight: true
    }
  ]

  const order: ProcurementOrder = {
    id: orderId,
    materialQuery: query,
    category,
    locality,
    targetBudget: 0,
    supplierName,
    supplierLocation,
    originalPrice: 0,
    negotiatedPrice: 0,
    savedAmount: 0,
    discountPercent: 100,
    landfillDiversionKg,
    carbonSavedKg,
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
