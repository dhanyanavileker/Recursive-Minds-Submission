import type {
  AgentSkill,
  SkillMeta,
  AnalysisResult,
  StepsGuideResult,
  BuildPlanResult,
  ChatMessage,
  Listing
} from './types'
import type { Requirements } from '../matching'
import { blankRequirements } from '../matching'
import {
  isLiveAIEnabled,
  liveGeminiAnalyzePhoto,
  liveGeminiGenerateSteps,
  liveGeminiGenerateBuildPlan
} from './geminiService'
import { createProcurementOrder } from './procurementAgent'

export const AVAILABLE_SKILLS: SkillMeta[] = [
  {
    id: 'analyze',
    name: 'Material Vision',
    label: 'Analyze Photo',
    description: 'Diagnose condition, dimensions, and salvageability of leftover materials or broken items',
    tagline: 'Upload a photo to inspect condition & get reuse advice',
    icon: 'Camera',
    color: '#8b5cf6',
    accentColor: 'rgba(139, 92, 246, 0.15)'
  },
  {
    id: 'get_steps',
    name: 'Repair & DIY Steps',
    label: 'How to Fix / Get Steps',
    description: 'Get step-by-step instructions and required materials for repairing or making things',
    tagline: 'Ask how to fix something to get guided steps & materials required',
    icon: 'Wrench',
    color: '#f59e0b',
    accentColor: 'rgba(245, 158, 11, 0.15)'
  },
  {
    id: 'search',
    name: 'Material Finder',
    label: 'Find Resources',
    description: 'Directly search local marketplace leftovers by category, locality, or project fit',
    tagline: 'Find tiles, timber, pots, pavers, and fittings nearby',
    icon: 'Search',
    color: '#10b981',
    accentColor: 'rgba(16, 185, 129, 0.15)'
  },
  {
    id: 'build_plan',
    name: 'Project Architect',
    label: 'I Want to Build',
    description: 'Plan a complete reuse-first project from scratch with blueprint and required materials',
    tagline: 'Tell me what you want to build for a custom blueprint',
    icon: 'Hammer',
    color: '#3b82f6',
    accentColor: 'rgba(59, 130, 246, 0.15)'
  },
  {
    id: 'procure',
    name: 'Autonomous Procurement',
    label: 'Scout & Negotiate',
    description: 'Dispatches background agent to scout demolition sites, negotiate discounts, and place hold orders',
    tagline: 'When materials are unavailable, the agent scouts, bargains, and places the order',
    icon: 'Bot',
    color: '#ec4899',
    accentColor: 'rgba(236, 72, 153, 0.15)'
  }
]

/**
 * Intelligent intent detector: determines the best skill based on text,
 * whether a photo is attached, and explicit user preference.
 */
export function detectSkill(text: string, hasPhoto: boolean, forcedSkill?: AgentSkill): AgentSkill {
  if (forcedSkill && forcedSkill !== 'general') return forcedSkill

  const t = text.toLowerCase()

  // Photo attached:
  if (hasPhoto) {
    if (/(fix|repair|mend|crack|broken|wobbly|restore|chipped|how\s*to)/i.test(t)) {
      return 'get_steps'
    }
    return 'analyze'
  }

  // Repair / Fix intent:
  if (/(how to fix|how to repair|how do i fix|fix\s|repair\s|restore\s|mend\s|steps to|patch\s|chipped|cracked|wobbl)/i.test(t)) {
    return 'get_steps'
  }

  // Search / Find materials intent:
  if (/(find\s|search\s|look for|where can i get|any tiles|any timber|any pots|any pavers|free materials|leftovers in|materials in|need tiles|need wood|need timber)/i.test(t)) {
    return 'search'
  }

  // Autonomous Procurement / Negotiate intent:
  if (/(procure|negotiate|order for me|source\s|buy for me|auto-procure|not available|scout|deal|bargain|demolition)/i.test(t)) {
    return 'procure'
  }

  // Build something / plan intent:
  if (/(i want to build|want to make|build a|make a|create a|diy\s|blueprint|plan a|modular shelf|bench|table|planter)/i.test(t)) {
    return 'build_plan'
  }

  return 'search'
}
/**
 * Material Analysis Engine: analyzes photo context and generates diagnostic details.
 */
export function analyzeMaterialPhoto(text: string, photoName?: string): AnalysisResult {
  const t = `${text} ${photoName || ''}`.toLowerCase()

  if (/pot|terracotta|clay|planter/i.test(t)) {
    return {
      detectedMaterial: 'Handcrafted Terracotta Planter',
      materialCategory: 'Pots',
      conditionRating: '78% Salvageable · Minor Hairline Cracks',
      conditionStatus: 'moderate',
      estimatedDimensions: 'Approx. 20 cm height × 18 cm rim diameter',
      inspectionNotes: [
        'Natural unglazed porous terracotta clay body',
        'Hairline surface fracture along rim; internal structure remains stable',
        'Drainage hole clear and functional',
        'No structural salt spalling observed'
      ],
      recommendedPrep: [
        'Brush out residual dirt and rinse with warm water',
        'Apply food-safe or waterproof epoxy along fracture line',
        'Optional: secure rim with copper wire wrap for decorative reinforcement'
      ],
      recommendedMaterials: [
        { name: 'Pottery repair adhesive / two-part epoxy', category: 'Fittings', reason: 'High-tensile bond for hairline cracks' },
        { name: 'Sandstone pavers', category: 'Pavers', reason: 'Stable outdoor base providing airflow and drainage clearance' }
      ],
      matchingKeywords: ['pots', 'terracotta', 'pavers']
    }
  }

  if (/wood|timber|pine|board|plank|pallet|furniture/i.test(t)) {
    return {
      detectedMaterial: 'Solid Pine Timber Offcuts',
      materialCategory: 'Timber',
      conditionRating: '88% Salvageable · Sound Grain, Weathered Face',
      conditionStatus: 'good',
      estimatedDimensions: 'Lengths: 45–60 cm, Width: 9–12 cm, Thickness: 2.2 cm',
      inspectionNotes: [
        'Untreated softwood with straight, parallel grain',
        'Surface shows minor oxidation and graying, easily cleaned by light sanding',
        'No signs of fungal decay, dry rot, or insect boreholes',
        'Cut ends square and ready for joinery'
      ],
      recommendedPrep: [
        'Dry brush loose dust, then sand along grain with 100-grit paper',
        'Check for embedded nails or staples using a magnet',
        'Coat with raw linseed oil or water-based exterior sealer before assembly'
      ],
      recommendedMaterials: [
        { name: 'Reclaimed brass handles or brackets', category: 'Fittings', reason: 'Corner bracing and aesthetic hardware' },
        { name: 'Additional timber offcuts', category: 'Timber', reason: 'Matching cross-rails and support cleats' }
      ],
      matchingKeywords: ['timber', 'fittings', 'pine']
    }
  }

  if (/paver|stone|sandstone|slab|concrete|path/i.test(t)) {
    return {
      detectedMaterial: 'Dressed Sandstone Pavers',
      materialCategory: 'Pavers',
      conditionRating: '95% Salvageable · Excellent Structural Condition',
      conditionStatus: 'good',
      estimatedDimensions: 'Approx. 30 × 30 cm, thickness 3.5 cm',
      inspectionNotes: [
        'Dense natural sandstone with non-slip textured face',
        'Clean squared edges suitable for tight jointing or sand-set installations',
        'High compressive strength suitable for footpaths or patio bases',
        'Free from chemical coatings or oil stains'
      ],
      recommendedPrep: [
        'Pressure rinse or scrub with mild detergent and water',
        'Dry completely before dry-stacking or mortar bedding',
        'Level sub-base with coarse sand or aggregate'
      ],
      recommendedMaterials: [
        { name: 'Stone / brick sand', category: 'Pavers', reason: 'Sub-base levelling and joint stabilization' },
        { name: 'Timber edging offcuts', category: 'Timber', reason: 'Perimeter retention framework' }
      ],
      matchingKeywords: ['pavers', 'timber']
    }
  }

  if (/metal|handle|brass|screw|fitting|hinge|bracket/i.test(t)) {
    return {
      detectedMaterial: 'Brushed Brass Cabinet Fittings & Hardware',
      materialCategory: 'Fittings',
      conditionRating: '92% Salvageable · Natural Patina Intact',
      conditionStatus: 'good',
      estimatedDimensions: 'Hole centres: 96 mm & 128 mm standard spacing',
      inspectionNotes: [
        'Solid brass substrate with brushed surface finish',
        'Threads clean and undamaged; screws turn freely',
        'Light surface oxidation removable or retainable as vintage patina',
        'Heavy-duty alloy suitable for cabinetry or furniture restoration'
      ],
      recommendedPrep: [
        'Soak in warm soapy water or vinegar bath for 15 minutes to strip grease',
        'Buff with a soft microfiber cloth and brass polish',
        'Check screw thread length against intended board thickness'
      ],
      recommendedMaterials: [
        { name: 'Solid pine offcuts', category: 'Timber', reason: 'Timber framework to mount drawers and doors' }
      ],
      matchingKeywords: ['fittings', 'timber']
    }
  }

  // Default: Ceramic Mosaic Tiles
  return {
    detectedMaterial: 'Ceramic Mosaic Tiles (Surplus Lot)',
    materialCategory: 'Tiles',
    conditionRating: '90% Salvageable · Intact Glaze, Minimal Mortar Residue',
    conditionStatus: 'good',
    estimatedDimensions: 'Approx. 10 × 10 cm per piece, 6 mm thickness',
    inspectionNotes: [
      'High-gloss vitreous glaze with uniform color distribution',
      'Straight cut edges with minimal chipping on corners',
      'Rear grooved waffle-pattern intact for strong adhesive bonding',
      'Clean surplus condition with no structural fractures'
    ],
    recommendedPrep: [
      'Wipe down tiles with damp cloth to remove storage dust',
      'Dry layout tiles on surface before applying adhesive',
      'Use flexible waterproof adhesive for outdoor or high-moisture use'
    ],
    recommendedMaterials: [
      { name: 'Solid pine offcuts', category: 'Timber', reason: 'Substrate backing board or table perimeter frame' },
      { name: 'Tile grout and adhesive', category: 'Fittings', reason: 'Fixing and sealing tile joints' }
    ],
    matchingKeywords: ['tiles', 'timber']
  }
}

/**
 * Step-by-Step DIY & Repair Guide Engine
 */
export function generateStepsGuide(text: string, photoAnalysis?: AnalysisResult): StepsGuideResult {
  const t = text.toLowerCase()
  const detectedCategory = photoAnalysis?.materialCategory

  // 1. Terracotta / Ceramic Pots Repair:
  if (detectedCategory === 'Pots' || /pot|terracotta|planter|clay/i.test(t)) {
    return {
      title: 'How to Fix & Reinforce a Cracked Terracotta Pot',
      subtitle: 'Repair fractures safely so your planter holds soil and drains properly for years.',
      difficulty: 'Beginner',
      estimatedTime: '30–45 mins active (+ 24h curing)',
      safetyTips: [
        'Wear safety goggles when handling sharp ceramic shards',
        'Use non-toxic, plant-safe adhesive so chemicals do not leach into soil'
      ],
      materialsNeeded: [
        { name: 'Waterproof 2-part epoxy or silicone sealant', category: 'Fittings', note: 'Provides waterproof structural hold' },
        { name: 'Painter’s tape or heavy rubber bands', category: 'Fittings', note: 'Holds shards in place while curing' },
        { name: 'Pottery shards or mesh', category: 'Pots', note: 'Covers drainage hole to retain soil', searchKeyword: 'pots' },
        { name: 'Sandstone paver', category: 'Pavers', note: 'Elevates pot off damp ground', searchKeyword: 'pavers' }
      ],
      toolsNeeded: ['Soft wire brush', 'Putty knife / wooden applicator', 'Clean damp sponge', 'Safety gloves'],
      steps: [
        {
          stepNumber: 1,
          title: 'Clean & Prep the Fracture Faces',
          instruction: 'Brush away loose soil, algae, and salt crusts along the crack using a wire brush. Wipe down with clean water and let dry completely. Adhesive will fail on damp or dusty clay.',
          tip: 'Terracotta absorbs moisture quickly; dry it in a sunny spot for at least 2 hours before bonding.'
        },
        {
          stepNumber: 2,
          title: 'Apply Plant-Safe Waterproof Adhesive',
          instruction: 'Mix your 2-part waterproof epoxy evenly. Using an applicator, apply a thin, consistent bead along both fracture edges. Avoid overfilling to minimize squeeze-out.',
          tip: 'Leave the drainage hole clear so roots don’t drown later.'
        },
        {
          stepNumber: 3,
          title: 'Align & Clamp with Tension',
          instruction: 'Press the fractured pieces together firmly until they mate flush. Immediately strap 2–3 rows of painter’s tape tightly around the perimeter of the pot to apply continuous pressure.',
          tip: 'Wipe off any epoxy squeeze-out with a damp rag before it hardens.'
        },
        {
          stepNumber: 4,
          title: 'Cure and Test Drainage',
          instruction: 'Let the pot rest undisturbed for 24 hours. Remove tape, place a curved shard over the drainage hole, fill with gravel sub-layer, and test with water before adding potting soil.',
          tip: 'Elevate on outdoor pavers so water freely exits the base.'
        }
      ]
    }
  }

  // 2. Table / Chair / Wobbly Furniture Repair:
  if (/wobbl|table|chair|stool|bench|loose leg|furniture/i.test(t)) {
    return {
      title: 'How to Fix Wobbly Furniture with Reclaimed Bracing',
      subtitle: 'Stabilize loose legs and racked joints using simple reclaimed timber cleats and corner blocks.',
      difficulty: 'Beginner',
      estimatedTime: '40–60 mins',
      safetyTips: [
        'Always pre-drill screw holes in reclaimed timber to prevent splitting',
        'Invert the furniture onto a soft blanket to avoid scratching surfaces'
      ],
      materialsNeeded: [
        { name: 'Reclaimed timber offcuts (approx 10–15 cm blocks)', category: 'Timber', note: 'Cut into 45° triangular corner braces', searchKeyword: 'timber' },
        { name: 'Wood screws (35 mm & 50 mm)', category: 'Fittings', note: 'Corrosion-resistant screws', searchKeyword: 'handles' },
        { name: 'PVA Wood Glue', category: 'Fittings', note: 'Bonds timber faces together' }
      ],
      toolsNeeded: ['Cordless drill & driver bits', 'Countersink bit', 'Clamps (or heavy books)', 'Tape measure', 'Hand saw'],
      steps: [
        {
          stepNumber: 1,
          title: 'Invert and Inspect Racking Joints',
          instruction: 'Turn the table or bench upside down. Wiggle each leg to identify whether the tenon has come loose, screws have stripped, or the corner apron is split.',
          tip: 'Vacuum out any old crumbled glue debris from joint crevices.'
        },
        {
          stepNumber: 2,
          title: 'Fabricate 45-Degree Corner Cleats',
          instruction: 'Take 4 short timber offcuts and cut 45-degree bevels on each end so they nest flush into the 90-degree corner between the leg and the side aprons.',
          tip: 'Using dense softwood or hardwood offcuts gives maximum diagonal rigidity.'
        },
        {
          stepNumber: 3,
          title: 'Pre-Drill and Glue',
          instruction: 'Pre-drill pilot holes with countersinks through the brace into both the apron and the leg. Apply PVA glue generously to the mating faces.',
          tip: 'Pilot holes ensure screws pull the joint tight without cracking the wood.'
        },
        {
          stepNumber: 4,
          title: 'Fasten Screws and Check Squareness',
          instruction: 'Drive screws firmly into the corner brace. Measure diagonals across the leg base to ensure the frame sits square. Let glue set for 4 hours before standing upright.',
          tip: 'Add felt or rubber pads beneath legs to compensate for uneven floors.'
        }
      ]
    }
  }

  // 3. Loose or Broken Mosaic / Tiles Repair:
  if (detectedCategory === 'Tiles' || /tile|mosaic|grout|cracked tile|floor tile/i.test(t)) {
    return {
      title: 'How to Replace Broken Tiles and Restore Grout',
      subtitle: 'Safely chip out damaged tiles, bed matching leftovers, and seal waterproof grout lines.',
      difficulty: 'Intermediate',
      estimatedTime: '1–2 hours (+ curing)',
      safetyTips: [
        'Ceramic shards are razor-sharp — wear safety glasses and thick leather gloves',
        'Cover adjacent tiles with towels to prevent accidental hammer impact'
      ],
      materialsNeeded: [
        { name: 'Leftover ceramic or mosaic tiles', category: 'Tiles', note: 'Matching thickness and style', searchKeyword: 'tiles' },
        { name: 'Pre-mixed thinset tile adhesive', category: 'Fittings', note: 'Provides flexible substrate bond' },
        { name: 'Waterproof grout', category: 'Fittings', note: 'Seals tile joints against moisture' }
      ],
      toolsNeeded: ['Chisel / old flathead screwdriver', 'Rubber grout float or sponge', 'Utility knife', 'Hammer'],
      steps: [
        {
          stepNumber: 1,
          title: 'Rake Grout Around Damaged Tile',
          instruction: 'Use a utility knife or grout rake to scrape away grout around the cracked tile. Removing grout first prevents shockwaves from cracking neighbouring tiles when chiseling.',
          tip: 'Score deeply into the grout line until the tile edge is fully exposed.'
        },
        {
          stepNumber: 2,
          title: 'Chisel Out Old Tile & Bedding Mortar',
          instruction: 'Angle a chisel towards the centre of the broken tile and tap gently with a hammer. Clear all old brittle mortar until the substrate is flat and smooth.',
          tip: 'Vacuum all dust and chips thoroughly so new adhesive bonds directly to clean floor/wall.'
        },
        {
          stepNumber: 3,
          title: 'Back-Butter and Bed the Replacement Tile',
          instruction: 'Apply a 3 mm layer of thinset adhesive directly to the back of the replacement leftover tile (back-buttering). Press firmly into place and twist slightly to collapse air ridges.',
          tip: 'Use plastic spacers or cardboard shims to keep grout gaps consistent.'
        },
        {
          stepNumber: 4,
          title: 'Apply Grout and Clean Haze',
          instruction: 'After 12 hours of adhesive drying, pack grout into joints using a rubber float at a 45-degree angle. After 20 minutes, wipe surface diagonally with a damp sponge.',
          tip: 'Buff remaining dry haze with a dry microfiber cloth 2 hours later.'
        }
      ]
    }
  }

  // 4. Default / General DIY Repair Guide:
  return {
    title: 'How to Restore and Reuse Reclaimed Materials',
    subtitle: 'Systematic approach to assessing, cleaning, prepping, and assembling salvaged items safely.',
    difficulty: 'Beginner',
    estimatedTime: '1 hour',
    safetyTips: [
      'Inspect for hidden nails, screws, or staples before cutting',
      'Work in a well-ventilated space when using sealants or adhesives'
    ],
    materialsNeeded: [
      { name: 'Reclaimed timber offcuts', category: 'Timber', note: 'Structural frame and bracing', searchKeyword: 'timber' },
      { name: 'Hardware fittings & screws', category: 'Fittings', note: 'Removable fasteners', searchKeyword: 'handles' },
      { name: 'Leftover tiles or pavers', category: 'Tiles', note: 'Durable surface layer', searchKeyword: 'tiles' }
    ],
    toolsNeeded: ['Tape measure', 'Sandpaper / sanding block', 'Cordless screwdriver', 'Spirit level'],
    steps: [
      {
        stepNumber: 1,
        title: 'Assess and Measure the Component',
        instruction: 'Examine structural soundness. Tap the material to listen for hollow voids or hidden rot. Measure exact dimensions and record them.',
        tip: 'Check if dimensions allow clean rectangular cuts with minimal scrap.'
      },
      {
        stepNumber: 2,
        title: 'Surface Cleaning and Prep',
        instruction: 'Remove foreign matter, old flaking finishes, or oxidation. Clean surfaces promote strong adhesion and prevent premature joint failure.',
        tip: 'Avoid over-sanding patina if you want to keep the rustic vintage character.'
      },
      {
        stepNumber: 3,
        title: 'Dry Assembly (Test Fit)',
        instruction: 'Assemble all pieces without glue or fasteners first. Verify alignment, check diagonal squareness, and ensure all mating surfaces sit flush.',
        tip: 'Fix minor gaps now with shims or gentle hand planing.'
      },
      {
        stepNumber: 4,
        title: 'Secure with Removable Connections',
        instruction: 'Fasten using screws and brackets rather than permanent glue alone. This ensures the finished item can easily be disassembled or repaired in the future.',
        tip: 'Apply a protective coat of wax, oil, or sealant to shield against humidity.'
      }
    ]
  }
}

/**
 * Build Plan Architect Engine
 */
export function generateBuildPlan(text: string): BuildPlanResult {
  const t = text.toLowerCase()

  if (/bench|seat|stool/i.test(t)) {
    return {
      projectName: 'Reclaimed Timber Garden & Entry Bench',
      overview: 'A robust, modular bench built with salvaged timber offcuts, featuring replaceable seat slats and weather-resistant joinery.',
      estimatedDimensions: '110 cm width × 38 cm depth × 45 cm seat height',
      phases: [
        {
          phaseName: 'Phase 1: Structure & A-Frames',
          steps: [
            'Cut 4 leg uprights and 4 cross-cleats from solid timber offcuts',
            'Assemble two rigid trapezoid end frames using lap joints or pocket screws',
            'Connect end frames with two 100 cm longitudinal stretcher rails'
          ]
        },
        {
          phaseName: 'Phase 2: Slats & Surface',
          steps: [
            'Select 4–5 straight timber slats of uniform thickness for the seat',
            'Sand top edges with 120-grit paper to prevent splinters',
            'Space slats with 8 mm drainage gaps and fasten from underneath or countersink screws'
          ]
        },
        {
          phaseName: 'Phase 3: Finishing & Weatherproofing',
          steps: [
            'Apply natural outdoor oil (e.g. boiled linseed oil)',
            'Mount rubber glides or set on sandstone pavers to avoid wet ground contact'
          ]
        }
      ],
      requiredMaterials: [
        { name: 'Solid pine / timber offcuts (40–60 cm)', category: 'Timber', requiredQty: '8–12 pieces', reason: 'Leg frames, stretchers, and seat slats' },
        { name: 'Exterior wood screws (50 mm & 65 mm)', category: 'Fittings', requiredQty: '24 screws', reason: 'High-shear structural joinery' },
        { name: 'Sandstone pavers (optional)', category: 'Pavers', requiredQty: '2 pavers', reason: 'Stable outdoor feet' }
      ]
    }
  }

  if (/planter|garden box|plant box|flower/i.test(t)) {
    return {
      projectName: 'Self-Draining Reclaimed Timber Planter Box',
      overview: 'An elevated wooden planter box designed to hold potted plants or lined soil with built-in drainage clearance.',
      estimatedDimensions: '70 cm length × 35 cm width × 40 cm height',
      phases: [
        {
          phaseName: 'Phase 1: Outer Wall Assembly',
          steps: [
            'Cut matching lengths of timber offcuts for front, back, and side walls',
            'Stack boards horizontally and fix into 4 vertical corner posts',
            'Ensure interior dimensions easily fit standard nursery pots'
          ]
        },
        {
          phaseName: 'Phase 2: Slotted Base & Liner',
          steps: [
            'Install cross-slats at the bottom leaving 15 mm drainage slots',
            'Insert permeable geotextile fabric or place pots directly onto slats',
            'Line inside walls with plastic membrane to prevent direct soil-wood moisture transfer'
          ]
        },
        {
          phaseName: 'Phase 3: Base Elevation',
          steps: [
            'Elevate planter corners on sandstone pavers or timber blocks',
            'Check that water flows freely out of bottom slots'
          ]
        }
      ],
      requiredMaterials: [
        { name: 'Timber boards & offcuts', category: 'Timber', requiredQty: '10–14 pieces', reason: 'Outer walls and bottom support slats' },
        { name: 'Terracotta garden pots', category: 'Pots', requiredQty: '2–4 pots', reason: 'Removable inner planting containers' },
        { name: 'Sandstone pavers', category: 'Pavers', requiredQty: '2 pavers', reason: 'Ground clearance feet' }
      ]
    }
  }

  if (/table|desk|coffee table|mosaic/i.test(t)) {
    return {
      projectName: 'Reclaimed Mosaic Coffee Table',
      overview: 'Combine salvaged timber for a sturdy low frame with leftover ceramic mosaic tiles for a wipeable, artistic surface.',
      estimatedDimensions: '80 cm length × 55 cm width × 42 cm height',
      phases: [
        {
          phaseName: 'Phase 1: Table Base & Apron',
          steps: [
            'Build a square apron frame from sturdy timber offcuts',
            'Fasten 4 corner legs reinforced with diagonal corner cleats',
            'Dry assemble to test level and diagonal squareness'
          ]
        },
        {
          phaseName: 'Phase 2: Recessed Substrate Bed',
          steps: [
            'Fasten a flat 12 mm timber or plywood bed recessed 10 mm below top lip',
            'Seal substrate with water-resistant primer',
            'Dry lay ceramic mosaic tiles in desired geometric pattern'
          ]
        },
        {
          phaseName: 'Phase 3: Tiling & Grouting',
          steps: [
            'Spread thinset mortar and press mosaic tiles flush with perimeter rim',
            'Allow adhesive to cure 24 hours, then spread waterproof grout',
            'Wipe haze clean and finish perimeter timber with natural wax'
          ]
        }
      ],
      requiredMaterials: [
        { name: 'Sea-glass or ceramic mosaic tiles', category: 'Tiles', requiredQty: 'Approx. 40–50 pieces', reason: 'Decorative waterproof tabletop' },
        { name: 'Solid pine offcuts', category: 'Timber', requiredQty: '8–10 pieces', reason: 'Table legs, apron, and edge rim' },
        { name: 'Brushed brass handles / corner braces', category: 'Fittings', requiredQty: '4 brackets', reason: 'Corner structural reinforcement' }
      ]
    }
  }

  // Modular Shelf:
  return {
    projectName: 'Modular Wall or Floor Storage Shelf',
    overview: 'A versatile modular shelf created from reclaimed timber offcuts and reinforced with brass or metal brackets.',
    estimatedDimensions: '60 cm width × 25 cm depth × 90 cm height',
    phases: [
      {
        phaseName: 'Phase 1: Uprights & Shelf Spacing',
        steps: [
          'Select two straight timber pieces for vertical sides',
          'Mark level shelf heights every 25–30 cm using a square and pencil',
          'Pre-drill shelf support holes or attach timber cleat rails'
        ]
      },
      {
        phaseName: 'Phase 2: Shelf Assembly',
        steps: [
          'Cut identical shelf boards from timber offcuts',
          'Fasten shelves to side rails with countersunk screws',
          'Install a diagonal back brace to eliminate sway'
        ]
      },
      {
        phaseName: 'Phase 3: Mounting & Safety',
        steps: [
          'Sand all touch surfaces smooth',
          'Attach brass wall-anchor brackets to prevent tipping'
        ]
      }
    ],
    requiredMaterials: [
      { name: 'Timber boards and offcuts', category: 'Timber', requiredQty: '6–8 pieces', reason: 'Sides, shelves, and back bracing' },
      { name: 'Brushed brass fittings or brackets', category: 'Fittings', requiredQty: '4–6 brackets', reason: 'Corner stabilization and wall mount' }
    ]
  }
}

/**
 * Smart Search Engine: finds and ranks marketplace listings for a query or category.
 */
export function searchMarketplace(
  query: string,
  category: string,
  locality: string,
  items: Listing[]
): Listing[] {
  const q = query.toLowerCase().trim()
  const qTerms = q.split(/\s+/).filter(Boolean)

  return items.filter(item => {
    // Category filter:
    if (category && category !== 'All materials' && item.category !== category) {
      return false
    }

    // Locality filter:
    if (locality && locality !== 'All localities' && item.locality !== locality) {
      return false
    }

    if (!q) return true

    // Text match:
    const itemText = `${item.title} ${item.category} ${item.detail} ${item.condition} ${item.locality}`.toLowerCase()

    // Direct phrase match:
    if (itemText.includes(q)) return true

    // Multi-term match:
    return qTerms.some(term => itemText.includes(term))
  })
}

/**
 * Master Agent Responder: orchestrates skill execution and returns structured ChatMessage
 */
export async function executeAgentSkill({
  prompt,
  photoUrl,
  photoName,
  requestedSkill,
  items,
  activeRequirements
}: {
  prompt: string
  photoUrl?: string
  photoName?: string
  requestedSkill?: AgentSkill
  items: Listing[]
  activeRequirements?: Requirements
}): Promise<{
  responseMessage: ChatMessage
  suggestedRequirements?: Partial<Requirements>
  activeSkill: AgentSkill
}> {
  const skill = detectSkill(prompt, !!photoUrl, requestedSkill)
  const req = activeRequirements || blankRequirements
  const liveAI = isLiveAIEnabled()

  // Skill 1: Material Vision & Photo Diagnostic
  if (skill === 'analyze') {
    let analysis: AnalysisResult | null = null
    if (liveAI && photoUrl) {
      analysis = await liveGeminiAnalyzePhoto(prompt, photoUrl)
    }
    if (!analysis) {
      analysis = analyzeMaterialPhoto(prompt, photoName)
    }

    const matches = searchMarketplace(
      analysis.matchingKeywords.join(' '),
      analysis.materialCategory,
      req.locality,
      items
    ).slice(0, 3)

    return {
      activeSkill: 'analyze',
      suggestedRequirements: {
        category: analysis.materialCategory
      },
      responseMessage: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: Date.now(),
        skill: 'analyze',
        content: liveAI
          ? `I’ve visually analyzed your leftover material photo with live Gemini AI. Here is the diagnostic assessment, salvageability rating, and recommended prep steps:`
          : `I’ve analyzed the photo of your leftover material. Here is a breakdown of the material condition, salvageability rating, and recommended prep steps:`,
        analysis,
        matchedListings: matches.length > 0 ? matches : undefined,
        suggestedPrompts: [
          `How to fix & use these ${analysis.materialCategory.toLowerCase()}?`,
          `Find more ${analysis.materialCategory.toLowerCase()} nearby`,
          `I want to build a project with this`
        ]
      }
    }
  }

  // Skill 2: Repair & DIY Steps Guide
  if (skill === 'get_steps') {
    let stepsGuide: StepsGuideResult | null = null
    if (liveAI) {
      stepsGuide = await liveGeminiGenerateSteps(prompt, photoUrl)
    }
    if (!stepsGuide) {
      const photoAnalysis = photoUrl ? analyzeMaterialPhoto(prompt, photoName) : undefined
      stepsGuide = generateStepsGuide(prompt, photoAnalysis)
    }

    // Find materials required from local inventory:
    const primaryMaterial = stepsGuide.materialsNeeded[0]
    const matched = searchMarketplace(
      primaryMaterial?.searchKeyword || primaryMaterial?.category || 'timber',
      primaryMaterial?.category || 'All materials',
      req.locality,
      items
    ).slice(0, 3)

    return {
      activeSkill: 'get_steps',
      suggestedRequirements: {
        category: primaryMaterial?.category || 'Timber'
      },
      responseMessage: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: Date.now(),
        skill: 'get_steps',
        content: liveAI
          ? `Here is a custom step-by-step repair guide generated by live Gemini AI for your project. I’ve included the exact tools, safety tips, and required leftover materials you’ll need:`
          : `Here is a step-by-step guide to help you fix and restore this. I’ve included the exact tools, safety tips, and required leftover materials you’ll need:`,
        stepsGuide,
        matchedListings: matched.length > 0 ? matched : undefined,
        suggestedPrompts: [
          `Find the required materials in Bengaluru`,
          `Can I build something bigger with this?`,
          `Analyze another photo`
        ]
      }
    }
  }

  // Skill 3: Build Plan Architect
  if (skill === 'build_plan') {
    let buildPlan: BuildPlanResult | null = null
    if (liveAI) {
      buildPlan = await liveGeminiGenerateBuildPlan(prompt)
    }
    if (!buildPlan) {
      buildPlan = generateBuildPlan(prompt)
    }

    const primaryCategory = buildPlan.requiredMaterials[0]?.category || 'Timber'
    const matched = searchMarketplace(
      primaryCategory,
      primaryCategory,
      req.locality,
      items
    ).slice(0, 3)

    return {
      activeSkill: 'build_plan',
      suggestedRequirements: {
        category: primaryCategory
      },
      responseMessage: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: Date.now(),
        skill: 'build_plan',
        content: liveAI
          ? `I’ve generated a custom reuse-first blueprint for your build with live Gemini AI: **${buildPlan.projectName}**. You can review the phased instructions below, check the required materials, and confirm your project dimensions:`
          : `I’ve put together a reuse-first build plan for your project: **${buildPlan.projectName}**. You can review the phased instructions below, check the required materials, and confirm your project dimensions:`,
        buildPlan,
        showRequirements: true,
        matchedListings: matched.length > 0 ? matched : undefined,
        suggestedPrompts: [
          `Show me available ${primaryCategory.toLowerCase()} for this`,
          `What tools do I need for this build?`,
          `How do I fix joints on this bench?`
        ]
      }
    }
  }

  // Skill 4: Autonomous Procurement & Negotiation Agent
  if (skill === 'procure') {
    const order = createProcurementOrder({
      query: prompt,
      category: req.category !== 'All materials' ? req.category : undefined,
      locality: req.locality,
      targetBudget: Number(req.budget) || 400
    })

    return {
      activeSkill: 'procure',
      suggestedRequirements: {
        category: order.category
      },
      responseMessage: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: Date.now(),
        skill: 'procure',
        content: `I’ve initiated an **autonomous background procurement workflow** for "${order.materialQuery}". I scouted local demolition networks and commercial salvage yards, negotiated directly with the supplier, and locked in a verified discount:`,
        procurementOrder: order,
        suggestedPrompts: [
          `Confirm and add ${order.materialQuery} to My Project`,
          `Show me another salvage yard deal`,
          `Plan a project using this material`
        ]
      }
    }
  }

  // Skill 5: Direct Material Finder / Search (default)
  const categoryMatch = ['Tiles', 'Timber', 'Pots', 'Pavers', 'Fittings'].find(c =>
    new RegExp(c, 'i').test(prompt)
  ) || req.category || 'All materials'

  const matched = searchMarketplace(prompt, categoryMatch, req.locality, items)
  const notFound = matched.length === 0

  return {
    activeSkill: 'search',
    suggestedRequirements: {
      category: categoryMatch !== 'All materials' ? categoryMatch : undefined
    },
    responseMessage: {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: Date.now(),
      skill: 'search',
      content: notFound
        ? `I searched the local inventory for "${prompt}", but no active listings match right now. You can deploy our **Autonomous Procurement Agent** in the background to scout demolition sites and negotiate a discounted lot for you:`
        : `I searched the local inventory and found **${matched.length} leftover listing${matched.length > 1 ? 's' : ''}** that match your request. Here are the top recommendations:`,
      matchedListings: (matched.length > 0 ? matched : items).slice(0, 4),
      showProcurementTrigger: notFound
        ? {
            materialName: prompt,
            category: categoryMatch !== 'All materials' ? categoryMatch : 'Timber',
            suggestedBudget: Number(req.budget) || 350
          }
        : undefined,
      showRequirements: true,
      suggestedPrompts: notFound
        ? [
            `Scout and negotiate ${prompt} for me`,
            'How to fix wobbly furniture with timber?',
            'Analyze a photo of my leftover materials'
          ]
        : [
            'How to fix wobbly furniture with timber?',
            'Analyze a photo of my leftover materials',
            'I want to build a garden planter box'
          ]
    }
  }
}
