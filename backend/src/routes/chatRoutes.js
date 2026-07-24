/**
 * RAHI Chat Routes — Powered by Google Gemini AI
 */

import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const RAHI_SYSTEM_PROMPT = `You are RAHI (Route & Adventure Helper Intelligence), an expert AI travel assistant created by TRAVLO. You help travelers plan trips, discover destinations, and make the most of their journeys.

Your personality:
- Friendly, enthusiastic, and knowledgeable
- Concise but detailed when needed
- Always helpful and encouraging
- Use relevant emojis occasionally for warmth

Your expertise:
- Destination recommendations across India and the world
- Budget optimization and cost estimates in Indian Rupees (₹)
- Itinerary suggestions and modifications
- Local food, culture, and safety tips
- Weather advice and best time to visit
- Packing suggestions
- Transportation options
- Emergency travel guidance

Always respond in a conversational, helpful tone. Format lists with bullet points. When suggesting places, include brief cost estimates in ₹.`

router.post('/message', async (req, res) => {
    const { message, history = [], context = {} } = req.body

    if (!message?.trim()) {
        return res.status(400).json({ error: 'Message is required' })
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        return res.json({
            response: `👋 Hi! I'm **RAHI**, your AI travel companion. I'm not fully connected yet — please add your **GEMINI_API_KEY** to the backend \`.env\` file to unlock my full capabilities.\n\nIn the meantime, feel free to use the AI Trip Planner above to generate your itinerary!`,
            timestamp: new Date().toISOString()
        })
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        // Build conversation history for Gemini
        const chatHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }))

        // Add context if a trip is loaded
        const contextPrefix = context.destination
            ? `[User is viewing a trip to ${context.destination} for ${context.days} days with budget ₹${context.budget}]\n`
            : ''

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: RAHI_SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: "Understood! I'm RAHI, ready to help with travel planning." }] },
                ...chatHistory
            ]
        })

        const result = await chat.sendMessage(contextPrefix + message)
        const response = result.response.text()

        res.json({ response, timestamp: new Date().toISOString() })
    } catch (err) {
        console.error('RAHI chat error:', err.message)
        res.status(500).json({
            error: 'RAHI is temporarily unavailable',
            response: "I'm having trouble connecting right now. Please try again in a moment. 🙏"
        })
    }
})

export default router
