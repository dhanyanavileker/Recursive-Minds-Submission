import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenAI } from '@google/genai'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8080

// Parse JSON with larger limit for image uploads
app.use(express.json({ limit: '10mb' }))

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

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

// Secure AI Photo Analysis proxy
app.post('/api/gemini/analyze', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'Gemini API key not configured on server' })
  }
  try {
    const { prompt, photoUrl } = req.body
    if (!photoUrl) {
      return res.status(400).json({ error: 'photoUrl is required' })
    }

    const { mimeType, base64Data } = parseDataUrl(photoUrl)
    const systemPrompt = `You are an expert circular economy & salvage material inspector for 're:source'.
Analyze the provided image of leftover or salvaged renovation material.
Return a STRICT JSON object with these EXACT keys:
{
  "detectedMaterial": "string",
  "materialCategory": "Tiles" | "Timber" | "Pots" | "Pavers" | "Fittings",
  "conditionRating": "string (e.g. 85% Salvageable · Good Sound Condition)",
  "conditionStatus": "good" | "moderate" | "worn",
  "estimatedDimensions": "string (estimated length, width, or thickness)",
  "inspectionNotes": ["string", "string", "string"],
  "recommendedPrep": ["string", "string", "string"],
  "recommendedMaterials": [{"name": "string", "category": "string", "reason": "string"}],
  "matchingKeywords": ["string", "string"]
}`

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [
        { text: `${systemPrompt}\n\nUser Notes: ${prompt || 'Inspect this leftover material.'}` },
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        }
      ]
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
Generate a step-by-step DIY repair and restoration guide based on the user's inquiry.
Prioritize reuse, salvage, and circular techniques.
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
      contents
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
Architect a complete reuse-first build plan using leftover and salvaged building materials.
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
      contents: [{ text: `${systemPrompt}\n\nProject request: ${prompt}` }]
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

// Fail-safe dual listener on port 80 if PORT was not 80 (handles Cloud Run port 80 health checks)
if (PORT !== 80) {
  try {
    app.listen(80, '0.0.0.0', () => {
      console.log('Re:Source Cloud Run server also listening on port 80')
    }).on('error', (err) => {
      console.log('Dual port 80 listener note:', err.message)
    })
  } catch (e) {
    // Ignore if unprivileged
  }
}
