import { GoogleGenAI } from '@google/genai'
import type { AnalysisResult, StepsGuideResult, BuildPlanResult } from './types'

// Check environment settings
export function isLiveAIEnabled(): boolean {
  const isEnabled = import.meta.env.VITE_ENABLE_LIVE_AI === 'true'
  const hasKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY)
  return isEnabled && hasKey
}

export function getGeminiModel(): string {
  return import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'
}

function getAIClient(): GoogleGenAI | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

/**
 * Extracts base64 and mime-type from Data URL
 */
function parseDataUrl(dataUrl: string): { mimeType: string; base64Data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (match) {
    return { mimeType: match[1], base64Data: match[2] }
  }
  // Default fallback if plain base64
  return { mimeType: 'image/jpeg', base64Data: dataUrl }
}

/**
 * Strips markdown code fences from JSON output if model returned ```json ... ```
 */
function cleanJsonOutput(text: string): string {
  return text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
}

/**
 * Helper to call secure backend proxy if running on Cloud Run / Node server
 */
async function callServerProxy<T>(endpoint: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      return (await res.json()) as T
    }
  } catch {
    // Server proxy not reachable, fall back to direct or offline
  }
  return null
}

/**
 * Multimodal Photo Diagnosis with Gemini
 */
export async function liveGeminiAnalyzePhoto(
  prompt: string,
  photoUrl: string
): Promise<AnalysisResult | null> {
  // 1. Try secure Cloud Run backend proxy
  const serverResult = await callServerProxy<AnalysisResult>('/api/gemini/analyze', { prompt, photoUrl })
  if (serverResult) return serverResult

  // 2. Fall back to direct client-side if configured
  if (!isLiveAIEnabled()) return null
  const ai = getAIClient()
  if (!ai) return null

  try {
    const { mimeType, base64Data } = parseDataUrl(photoUrl)
    const model = getGeminiModel()

    const systemPrompt = `You are an expert circular economy & salvage material inspector for 're:source'.
Analyze the provided image of leftover or salvaged renovation material.
Return a STRICT JSON object with these EXACT keys:
{
  "detectedMaterial": "string (specific name, e.g. Glazed Ceramic Wall Tiles, Pine 2x4 Offcuts, etc.)",
  "materialCategory": "Tiles" | "Timber" | "Pots" | "Pavers" | "Fittings",
  "conditionRating": "string (e.g. 85% Salvageable · Good Condition)",
  "conditionStatus": "good" | "moderate" | "worn",
  "inspectionNotes": ["string", "string", "string"],
  "estimatedDimensions": "string (e.g. approx 15x15 cm per piece)",
  "recommendedPrep": ["string", "string"],
  "recommendedMaterials": [{"name": "string", "category": "Tiles|Timber|Pots|Pavers|Fittings", "reason": "string"}],
  "matchingKeywords": ["string", "string"]
}
Only output the raw JSON string.`

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nUser Question/Context: ${prompt || 'Analyze this material photo for reuse.'}` },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    })

    const text = response.text
    if (!text) return null
    const parsed = JSON.parse(cleanJsonOutput(text)) as AnalysisResult
    return parsed
  } catch (err) {
    console.warn('Live Gemini Photo Analysis failed, falling back to local engine:', err)
    return null
  }
}

/**
 * Step-by-Step DIY & Repair Guide with Gemini
 */
export async function liveGeminiGenerateSteps(
  prompt: string,
  photoUrl?: string
): Promise<StepsGuideResult | null> {
  // 1. Try secure Cloud Run backend proxy
  const serverResult = await callServerProxy<StepsGuideResult>('/api/gemini/steps', { prompt, photoUrl })
  if (serverResult) return serverResult

  // 2. Fall back to direct client-side if configured
  if (!isLiveAIEnabled()) return null
  const ai = getAIClient()
  if (!ai) return null

  try {
    const model = getGeminiModel()
    const systemPrompt = `You are a master DIY repair specialist and maker guide for 're:source'.
The user wants to fix, repair, or restore something using reclaimed materials.
Generate a structured repair guide adhering STRICTLY to this JSON format:
{
  "title": "string (e.g. How to Repair a Cracked Terracotta Pot)",
  "subtitle": "string (one concise summary sentence)",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": "string (e.g. 30–45 mins active)",
  "materialsNeeded": [
    {"name": "string", "category": "Tiles|Timber|Pots|Pavers|Fittings", "note": "string", "searchKeyword": "string"}
  ],
  "toolsNeeded": ["string", "string"],
  "safetyTips": ["string", "string"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "string",
      "instruction": "string",
      "tip": "optional string"
    }
  ]
}
Only output the raw JSON string.`

    const parts: any[] = [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }]

    if (photoUrl) {
      const { mimeType, base64Data } = parseDataUrl(photoUrl)
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      })
    }

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts }]
    })

    const text = response.text
    if (!text) return null
    const parsed = JSON.parse(cleanJsonOutput(text)) as StepsGuideResult
    return parsed
  } catch (err) {
    console.warn('Live Gemini Steps Guide failed, falling back to local engine:', err)
    return null
  }
}

/**
 * Project Architect Blueprint with Gemini
 */
export async function liveGeminiGenerateBuildPlan(
  prompt: string
): Promise<BuildPlanResult | null> {
  // 1. Try secure Cloud Run backend proxy
  const serverResult = await callServerProxy<BuildPlanResult>('/api/gemini/build_plan', { prompt })
  if (serverResult) return serverResult

  // 2. Fall back to direct client-side if configured
  if (!isLiveAIEnabled()) return null
  const ai = getAIClient()
  if (!ai) return null

  try {
    const model = getGeminiModel()
    const systemPrompt = `You are a sustainable reuse architect for 're:source'.
The user wants to build a project from leftover materials (e.g. bench, table, shelf, planter).
Generate a structured project blueprint adhering STRICTLY to this JSON format:
{
  "projectName": "string",
  "overview": "string",
  "estimatedDimensions": "string (e.g. 100 cm x 40 cm x 45 cm)",
  "phases": [
    {
      "phaseName": "Phase 1: Structure & Framing",
      "steps": ["step 1 description", "step 2 description"]
    }
  ],
  "requiredMaterials": [
    {
      "name": "string",
      "category": "Tiles|Timber|Pots|Pavers|Fittings",
      "requiredQty": "string (e.g. 6-8 pieces)",
      "reason": "string"
    }
  ]
}
Only output the raw JSON string.`

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }]
    })

    const text = response.text
    if (!text) return null
    const parsed = JSON.parse(cleanJsonOutput(text)) as BuildPlanResult
    return parsed
  } catch (err) {
    console.warn('Live Gemini Build Plan failed, falling back to local engine:', err)
    return null
  }
}
