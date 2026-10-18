import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8080

// Parse JSON with larger limit for image uploads
app.use(express.json({ limit: '10mb' }))

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (match) {
    return { mimeType: match[1], base64Data: match[2] }
  }
  return { mimeType: 'image/jpeg', base64Data: dataUrl }
}

function cleanJson(text) {
  return text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    liveAI: Boolean(genAI),
    model: MODEL_NAME,
    timestamp: Date.now()
  })
})

// Runtime client configuration endpoint (supplies Cloud Run env vars to browser)
app.get('/api/config', (req, res) => {
  res.json({
    firebase: {
      apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || ''
    },
    liveAI: Boolean(genAI)
  })
})

// Secure AI Photo Analysis proxy
app.post('/api/gemini/analyze', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'Gemini API key not configured on server' })
  }
  try {
    const { prompt, photoUrl } = req.body
    const contents = []
    const systemPrompt = `You are an expert circular economy & community resource specialist for 're:source'.
Analyze the provided image or description of surplus, pre-loved, leftover, or repairable items (spanning Furniture, Electronic Items, Construction Materials, Packaging, or Household Goods).
Do NOT assume items originate from a demolition or construction site unless the user explicitly mentions demolition. Treat items as regular household, office, studio, or community surplus.
Return a STRICT JSON object with these EXACT keys:
{
  "detectedMaterial": "string (clear name of the item or material)",
  "materialCategory": "Furniture" | "Electronic Items" | "Construction Materials" | "Packaging" | "Household Items" | "Office Assets",
  "conditionRating": "string (e.g. 90% Usable · Clean Sound Condition)",
  "conditionStatus": "good" | "moderate" | "worn",
  "estimatedDimensions": "string (estimated dimensions, count, or capacity)",
  "inspectionNotes": ["string", "string", "string"],
  "recommendedPrep": ["string", "string", "string"],
  "recommendedMaterials": [{"name": "string", "category": "string", "reason": "string"}],
  "matchingKeywords": ["string", "string"]
}`

    contents.push({ text: `${systemPrompt}\n\nUser Notes: ${prompt || 'Inspect this leftover material.'}` })

    if (photoUrl) {
      const { mimeType, base64Data } = parseDataUrl(photoUrl)
      contents.push({
        inlineData: {
          mimeType,
          data: base64Data
        }
      })
    }

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: { responseMimeType: 'application/json' }
    })

    const text = response.text || ''
    const data = JSON.parse(cleanJson(text))
    res.json(data)
  } catch (err) {
    console.error('Error in /api/gemini/analyze:', err)
    res.status(500).json({ error: err.message || 'AI analysis failed' })
  }
})

// Secure AI Steps Guide proxy
app.post('/api/gemini/steps', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'Gemini API key not configured on server' })
  }
  try {
    const { prompt, photoUrl } = req.body
    const systemPrompt = `You are a master craftsman & repair specialist for 're:source'.
Generate a step-by-step DIY repair, upcycling, or restoration guide based on the user's inquiry (covering furniture restoration, electronics care, or construction material reuse).
Do NOT assume materials come from a demolition site. Focus on practical community reuse and DIY repair.
Return a STRICT JSON object with these EXACT keys:
{
  "title": "string",
  "subtitle": "string",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": "string",
  "materialsNeeded": [{"name": "string", "category": "string", "note": "string", "searchKeyword": "string"}],
  "toolsNeeded": ["string", "string"],
  "safetyTips": ["string", "string"],
  "steps": [{"stepNumber": 1, "title": "string", "instruction": "string", "tip": "string"}]
}`

    const contents = [{ text: `${systemPrompt}\n\nUser Project: ${prompt}` }]
    if (photoUrl) {
      const { mimeType, base64Data } = parseDataUrl(photoUrl)
      contents.push({
        inlineData: { mimeType, data: base64Data }
      })
    }

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: { responseMimeType: 'application/json' }
    })

    const text = response.text || ''
    const data = JSON.parse(cleanJson(text))
    res.json(data)
  } catch (err) {
    console.error('Error in /api/gemini/steps:', err)
    res.status(500).json({ error: err.message || 'AI steps generation failed' })
  }
})

// Secure AI Build Plan proxy
app.post('/api/gemini/build_plan', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'Gemini API key not configured on server' })
  }
  try {
    const { prompt } = req.body
    const systemPrompt = `You are a circular architect and sustainable product designer for 're:source'.
Architect a complete reuse-first build or restoration plan using community surplus items, pre-loved furniture, electronic items, or construction materials.
Do NOT assume materials come from a demolition site unless explicitly stated. Prioritize domestic, community, and office upcycling.
Return a STRICT JSON object with these EXACT keys:
{
  "projectName": "string",
  "overview": "string",
  "estimatedDimensions": "string",
  "phases": [{"phaseName": "string", "steps": ["string", "string"]}],
  "requiredMaterials": [{"name": "string", "category": "string", "requiredQty": "string", "reason": "string"}]
}`

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [{ text: `${systemPrompt}\n\nProject request: ${prompt}` }],
      config: { responseMimeType: 'application/json' }
    })

    const text = response.text || ''
    const data = JSON.parse(cleanJson(text))
    res.json(data)
  } catch (err) {
    console.error('Error in /api/gemini/build_plan:', err)
    res.status(500).json({ error: err.message || 'Build plan generation failed' })
  }
})

// Serve static assets from built Vite app
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// SPA Fallback: Any other unmatched route serves index.html (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Primary listener on Cloud Run's requested PORT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Re:Source Cloud Run server listening on port ${PORT}`)
  console.log(`Live Gemini AI: ${genAI ? 'ENABLED (Server Key)' : 'OFFLINE (Demo Mode)'}`)
})
