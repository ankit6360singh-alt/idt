/**
 * Itinerary Generator — Powered by Google Gemini AI
 * Replaces the previous Google Places / mock-based implementation
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Generate a full day-by-day itinerary using Gemini
 */
export const generateItinerary = async ({ destination, days, budget, travelerType, preferences }) => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        console.warn('⚠️  GEMINI_API_KEY not set — returning demo itinerary')
        return generateDemoItinerary(destination, days, travelerType)
    }

    const prompt = buildItineraryPrompt({ destination, days, budget, travelerType, preferences })

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent(prompt)
        const text = result.response.text()

        // Extract JSON from the response
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\[[\s\S]*\])/)
        const jsonStr = jsonMatch ? jsonMatch[1] : text

        const itinerary = JSON.parse(jsonStr)
        return Array.isArray(itinerary) ? itinerary : itinerary.itinerary || generateDemoItinerary(destination, days, travelerType)
    } catch (err) {
        console.error('Gemini itinerary error:', err.message)
        return generateDemoItinerary(destination, days, travelerType)
    }
}

const buildItineraryPrompt = ({ destination, days, budget, travelerType, preferences }) => {
    const today = new Date()
    const dates = Array.from({ length: days }, (_, i) => {
        const d = new Date(today); d.setDate(today.getDate() + i)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })

    return `You are RAHI, an expert AI travel planner. Generate a detailed ${days}-day travel itinerary for ${destination}.

Trip details:
- Destination: ${destination}
- Duration: ${days} days
- Total budget: ₹${budget}
- Traveler type: ${travelerType}
- Preferences: ${preferences || 'None specified'}
- Trip dates: ${dates.join(', ')}

Return ONLY a valid JSON array (no extra text). Each element represents one day:
\`\`\`json
[
  {
    "day": 1,
    "date": "${dates[0]}",
    "theme": "Arrival & First Impressions",
    "activities": [
      {
        "time": "9:00 AM",
        "title": "Place name",
        "description": "2-3 sentence engaging description tailored to ${travelerType} traveler",
        "location": "Specific area/landmark name",
        "cost": 500,
        "duration": "2 hours",
        "type": "attraction",
        "rating": 4.5,
        "tips": "Local tip for visiting this place"
      }
    ],
    "dayBudget": 5000,
    "meals": {
      "breakfast": { "name": "Restaurant", "cost": 200, "cuisine": "South Indian" },
      "lunch":     { "name": "Restaurant", "cost": 400, "cuisine": "Local" },
      "dinner":    { "name": "Restaurant", "cost": 600, "cuisine": "Goan/local" }
    },
    "transport": { "mode": "Taxi/Auto", "cost": 800, "notes": "Book in advance" },
    "weather": { "temp": "28°C", "condition": "Sunny", "tip": "Carry sunscreen" },
    "packingTip": "Day-specific packing advice",
    "safetyTip": "Safety advice for this day"
  }
]
\`\`\`

Include: morning attractions, lunch spot, afternoon activity, evening activity, dinner spot.
Activities per day: 4-6 activities. Keep costs realistic for ${travelerType} traveler in India.
Make descriptions vivid, specific to ${destination}, and relevant to ${travelerType} travel style.`
}

/**
 * Demo itinerary for when Gemini API key is not set
 */
const generateDemoItinerary = (destination, days, travelerType) => {
    const today = new Date()
    return Array.from({ length: days }, (_, i) => {
        const date = new Date(today); date.setDate(today.getDate() + i)
        return {
            day: i + 1,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            theme: i === 0 ? 'Arrival & Exploration' : i === days - 1 ? 'Final Day & Departure' : 'Full Day Adventure',
            activities: [
                {
                    time: '9:00 AM', type: 'attraction', rating: 4.5,
                    title: `${destination} Heritage Walk`,
                    description: `Start your day exploring the iconic landmarks of ${destination}. Perfect for ${travelerType} travelers seeking authentic local experiences and photo opportunities.`,
                    location: `${destination} Old Town`, cost: 300, duration: '2-3 hours',
                    tips: 'Visit early to avoid crowds'
                },
                {
                    time: '12:30 PM', type: 'restaurant', rating: 4.2,
                    title: 'Local Cuisine Lunch',
                    description: `Enjoy authentic local flavors at a popular eatery in ${destination}. Try the regional specialties!`,
                    location: `${destination} Market Area`, cost: 350, duration: '1 hour',
                    tips: 'Try the local specialty dish'
                },
                {
                    time: '2:30 PM', type: 'attraction', rating: 4.7,
                    title: `${destination} Scenic Viewpoint`,
                    description: `Take in breathtaking views of ${destination} from this popular vantage point. A must-visit for photography enthusiasts.`,
                    location: `${destination} Hills`, cost: 100, duration: '2 hours',
                    tips: 'Best visited in the late afternoon for golden hour photos'
                },
                {
                    time: '6:00 PM', type: 'leisure', rating: 4.3,
                    title: 'Evening Market Stroll',
                    description: `Explore the vibrant evening markets of ${destination}. Shop for local souvenirs and street food.`,
                    location: `${destination} Bazaar`, cost: 200, duration: '1.5 hours',
                    tips: 'Bargaining is common and expected'
                },
                {
                    time: '8:00 PM', type: 'restaurant', rating: 4.6,
                    title: 'Dinner at Local Restaurant',
                    description: `End your day with a delicious dinner at one of ${destination}'s best-rated restaurants.`,
                    location: `${destination} Restaurant District`, cost: 600, duration: '1.5 hours',
                    tips: 'Reserve a table in advance for weekend evenings'
                },
            ],
            dayBudget: Math.floor(2000 + Math.random() * 3000),
            meals: {
                breakfast: { name: 'Hotel/Guesthouse', cost: 150, cuisine: 'Continental/Indian' },
                lunch: { name: 'Local Dhaba', cost: 350, cuisine: 'Regional' },
                dinner: { name: 'Restaurant', cost: 600, cuisine: 'Multi-cuisine' },
            },
            transport: { mode: 'Auto/Cab', cost: 500, notes: 'Use app-based cabs for metered fares' },
            weather: { temp: '28°C', condition: 'Pleasant', tip: 'Carry a light jacket for evenings' },
            packingTip: 'Comfortable walking shoes recommended',
            safetyTip: 'Keep copies of important documents and emergency contacts saved'
        }
    })
}
