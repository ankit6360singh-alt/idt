/**
 * Recommendation Engine — OpenTripMap API
 * Replaces Google Places with free OpenTripMap data
 */

import axios from 'axios'

const OTM_BASE = 'https://api.opentripmap.com/0.1/en'

export const generateRecommendations = async ({ destination, days, budget, travelerType, preferences }) => {
    try {
        // 1. Geocode the destination using Nominatim (free)
        const geoRes = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: destination, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'TRAVLO-AI/1.0 (travel planning app)' },
            timeout: 8000
        })

        if (!geoRes.data?.length) {
            return buildDefaultRecommendations(destination, days, budget, travelerType)
        }

        const { lat, lon, display_name } = geoRes.data[0]
        const destName = display_name.split(',')[0]

        // 2. Get attractions from OpenTripMap (optional, if API key provided)
        let attractions = []
        if (process.env.OPENTRIPMAP_API_KEY && process.env.OPENTRIPMAP_API_KEY !== 'your_opentripmap_key_here') {
            try {
                const placesRes = await axios.get(`${OTM_BASE}/places/radius`, {
                    params: {
                        radius: 20000, lon, lat,
                        kinds: 'interesting_places,architecture,cultural,natural',
                        rate: 3, format: 'json', limit: 20,
                        apikey: process.env.OPENTRIPMAP_API_KEY
                    },
                    timeout: 8000
                })
                attractions = (placesRes.data || []).map(p => ({
                    name: p.name || 'Local Attraction',
                    location: { lat: p.point?.lat || parseFloat(lat), lng: p.point?.lon || parseFloat(lon) },
                    rating: (p.rate / 7 * 5).toFixed(1),
                    vicinity: destName,
                    placeId: p.xid,
                })).filter(p => p.name && p.name !== 'Local Attraction')
            } catch (e) {
                console.warn('OpenTripMap fetch skipped:', e.message)
            }
        }

        return {
            destination: destName || destination,
            destinationCoordinates: { lat: parseFloat(lat), lng: parseFloat(lon) },
            attractions,
            safetyScore: getSafetyScore(destination),
            travelScore: getTravelScore(destination, travelerType),
            recommendations: getRecommendations(destination, travelerType),
        }
    } catch (err) {
        console.error('Recommendation engine error:', err.message)
        return buildDefaultRecommendations(destination, days, budget, travelerType)
    }
}

const buildDefaultRecommendations = (destination, days, budget, travelerType) => ({
    destination,
    destinationCoordinates: null,
    attractions: [],
    safetyScore: 75,
    travelScore: 82,
    recommendations: getRecommendations(destination, travelerType),
})

const getSafetyScore = dest => {
    const safeDestinations = ['goa', 'kerala', 'rajasthan', 'himachal', 'uttarakhand', 'manali', 'shimla']
    const d = dest.toLowerCase()
    return safeDestinations.some(s => d.includes(s)) ? 85 + Math.floor(Math.random() * 10) : 72 + Math.floor(Math.random() * 15)
}

const getTravelScore = (dest, type) => {
    const base = 75 + Math.floor(Math.random() * 20)
    const bonus = { luxury: 10, couple: 5, family: 5, adventure: 8 }
    return Math.min(99, base + (bonus[type] || 0))
}

const getRecommendations = (dest, type) => {
    const tips = {
        solo: [
            'Book accommodation in advance, especially during peak season',
            'Join group tours to meet fellow travelers',
            'Keep emergency contacts saved offline',
            'Use local public transport for authentic experiences',
        ],
        couple: [
            'Book a sunrise/sunset viewpoint experience',
            'Look for couple packages at hotels',
            'Try a romantic dinner with local cuisine',
            'Avoid peak tourist hours for more intimate experiences',
        ],
        family: [
            'Check age restrictions at adventure activities',
            'Book family rooms or connecting hotel rooms',
            'Carry snacks and entertainment for kids',
            'Plan rest time between activities',
        ],
        friends: [
            'Split costs using a shared expense app',
            'Book group accommodation like hostels for better rates',
            'Plan one big group activity each day',
            'Try local street food markets together',
        ],
    }
    return tips[type] || tips.solo
}
