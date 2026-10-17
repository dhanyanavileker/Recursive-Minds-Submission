import type { Requirements } from '../matching'

export type Listing = {
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
  own?: boolean
  widthCm?: number
  lengthCm?: number
}

export type AgentSkill = 'analyze' | 'search' | 'get_steps' | 'build_plan' | 'procure' | 'general'

export interface SkillMeta {
  id: AgentSkill
  name: string
  label: string
  description: string
  tagline: string
  icon: string
  color: string
  accentColor: string
}

export interface AnalysisResult {
  detectedMaterial: string
  materialCategory: 'Tiles' | 'Timber' | 'Pots' | 'Pavers' | 'Fittings'
  conditionRating: string
  conditionStatus: 'good' | 'moderate' | 'worn'
  inspectionNotes: string[]
  estimatedDimensions?: string
  recommendedPrep: string[]
  recommendedMaterials: { name: string; category: string; reason: string }[]
  matchingKeywords: string[]
}

export interface StepsGuideResult {
  title: string
  subtitle: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  materialsNeeded: {
    name: string
    category: string
    note: string
    searchKeyword?: string
  }[]
  toolsNeeded: string[]
  safetyTips: string[]
  steps: {
    stepNumber: number
    title: string
    instruction: string
    tip?: string
  }[]
}

export interface BuildPlanResult {
  projectName: string
  overview: string
  estimatedDimensions?: string
  phases: {
    phaseName: string
    steps: string[]
  }[]
  requiredMaterials: {
    name: string
    category: string
    requiredQty: string
    reason: string
  }[]
}

export interface ProcurementOrder {
  id: string
  materialQuery: string
  category: string
  locality: string
  targetBudget: number
  supplierName: string
  supplierLocation: string
  originalPrice: number
  negotiatedPrice: number
  savedAmount: number
  discountPercent: number
  pickupWindow: string
  quantityDetails: string
  landfillDiversionKg?: number
  carbonSavedKg?: number
  status: 'scouting' | 'negotiating' | 'order_placed' | 'confirmed' | 'cancelled'
  progressStage: number // 1: Scouting, 2: Negotiating, 3: Order Placed
  negotiationTranscript: {
    sender: 'agent' | 'supplier'
    text: string
    timestamp: string
    highlight?: boolean
  }[]
  createdAt: number
  completedAt?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  timestamp: number
  content: string
  skill: AgentSkill
  photoUrl?: string
  photoName?: string
  analysis?: AnalysisResult
  stepsGuide?: StepsGuideResult
  buildPlan?: BuildPlanResult
  procurementOrder?: ProcurementOrder
  showProcurementTrigger?: {
    materialName: string
    category?: string
    suggestedBudget?: number
  }
  matchedListings?: Listing[]
  showRequirements?: boolean
  suggestedPrompts?: string[]
}

export interface ConversationSession {
  id: string
  title: string
  activeSkill: AgentSkill
  messages: ChatMessage[]
  requirements: Requirements
  ready: boolean
  updatedAt: number
}
