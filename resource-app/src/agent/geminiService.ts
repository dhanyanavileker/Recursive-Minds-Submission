import type { AnalysisResult, StepsGuideResult, BuildPlanResult } from './types'

// Check environment settings
export function isLiveAIEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_LIVE_AI === 'true'
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
    // Server proxy not reachable; the caller uses the offline demo fallback.
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

  return null
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

  return null
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

  return null
}
