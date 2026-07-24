// Google Places API Service
// Fetches real attractions, restaurants, and hotels

import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client({})
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'demo_key'

/**
 * Search for nearby places based on location and type
 */
export const searchNearbyPlaces = async ({ location, radius = 5000, type = 'tourist_attraction', keyword = '' }) => {
    try {
        const response = await client.placesNearby({
            params: {
                location,
                radius,
                type,
                keyword,
                key: GOOGLE_MAPS_API_KEY
            }
        })

        return response.data.results.map(place => ({
            placeId: place.place_id,
            name: place.name,
            rating: place.rating || 0,
            userRatingsTotal: place.user_ratings_total || 0,
            vicinity: place.vicinity,
            location: place.geometry.location,
            types: place.types,
            priceLevel: place.price_level,
            photos: place.photos ? place.photos.map(p => p.photo_reference) : [],
            openNow: place.opening_hours?.open_now
        }))
    } catch (error) {
        console.error('Google Places API error:', error.message)
        return []
    }
}

/**
 * Get detailed information about a specific place
 */
export const getPlaceDetails = async (placeId) => {
    try {
        const response = await client.placeDetails({
            params: {
                place_id: placeId,
                fields: ['name', 'rating', 'formatted_address', 'geometry', 'photos', 'reviews', 'opening_hours', 'price_level', 'types', 'website', 'formatted_phone_number'],
                key: GOOGLE_MAPS_API_KEY
            }
        })

        const place = response.data.result
        return {
            placeId,
            name: place.name,
            rating: place.rating || 0,
            address: place.formatted_address,
            location: place.geometry.location,
            photos: place.photos ? place.photos.map(p => p.photo_reference) : [],
            reviews: place.reviews || [],
            openingHours: place.opening_hours,
            priceLevel: place.price_level,
            types: place.types,
            website: place.website,
            phone: place.formatted_phone_number
        }
    } catch (error) {
        console.error('Place details error:', error.message)
        return null
    }
}

/**
 * Search for places by text query
 */
export const searchPlacesByText = async ({ query, location, radius = 10000 }) => {
    try {
        const response = await client.textSearch({
            params: {
                query,
                location,
                radius,
                key: GOOGLE_MAPS_API_KEY
            }
        })

        return response.data.results.map(place => ({
            placeId: place.place_id,
            name: place.name,
            rating: place.rating || 0,
            userRatingsTotal: place.user_ratings_total || 0,
            address: place.formatted_address,
            location: place.geometry.location,
            types: place.types,
            priceLevel: place.price_level,
            photos: place.photos ? place.photos.map(p => p.photo_reference) : []
        }))
    } catch (error) {
        console.error('Text search error:', error.message)
        return []
    }
}

/**
 * Get top-rated attractions for a destination
 */
export const getTopAttractions = async (destination, limit = 10) => {
    try {
        // First, geocode the destination to get coordinates
        const geocodeResponse = await client.geocode({
            params: {
                address: destination,
                key: GOOGLE_MAPS_API_KEY
            }
        })

        if (!geocodeResponse.data.results.length) {
            return []
        }

        const location = geocodeResponse.data.results[0].geometry.location

        // Search for tourist attractions
        const places = await searchNearbyPlaces({
            location: `${location.lat},${location.lng}`,
            radius: 15000,
            type: 'tourist_attraction'
        })

        // Sort by rating and number of reviews
        const sortedPlaces = places
            .filter(p => p.rating >= 3.5)
            .sort((a, b) => {
                const scoreA = a.rating * Math.log10(a.userRatingsTotal + 1)
                const scoreB = b.rating * Math.log10(b.userRatingsTotal + 1)
                return scoreB - scoreA
            })
            .slice(0, limit)

        return sortedPlaces
    } catch (error) {
        console.error('Get top attractions error:', error.message)
        return []
    }
}

/**
 * Get restaurants near a location
 */
export const getRestaurants = async ({ location, radius = 2000, minRating = 3.5, priceLevel = null }) => {
    try {
        const places = await searchNearbyPlaces({
            location,
            radius,
            type: 'restaurant'
        })

        let filtered = places.filter(p => p.rating >= minRating)

        if (priceLevel !== null) {
            filtered = filtered.filter(p => p.priceLevel === priceLevel)
        }

        return filtered.sort((a, b) => b.rating - a.rating)
    } catch (error) {
        console.error('Get restaurants error:', error.message)
        return []
    }
}

/**
 * Get hotels near a location
 */
export const getHotels = async ({ location, radius = 5000, minRating = 3.0, maxPriceLevel = 4 }) => {
    try {
        const places = await searchNearbyPlaces({
            location,
            radius,
            type: 'lodging'
        })

        return places
            .filter(p => p.rating >= minRating && (p.priceLevel || 0) <= maxPriceLevel)
            .sort((a, b) => b.rating - a.rating)
    } catch (error) {
        console.error('Get hotels error:', error.message)
        return []
    }
}

/**
 * Geocode an address to get coordinates
 */
export const geocodeAddress = async (address) => {
    try {
        const response = await client.geocode({
            params: {
                address,
                key: GOOGLE_MAPS_API_KEY
            }
        })

        if (!response.data.results.length) {
            return null
        }

        const result = response.data.results[0]
        return {
            address: result.formatted_address,
            location: result.geometry.location,
            placeId: result.place_id,
            types: result.types
        }
    } catch (error) {
        console.error('Geocoding error:', error.message)
        return null
    }
}

/**
 * Get photo URL for a photo reference
 */
export const getPhotoUrl = (photoReference, maxWidth = 400) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`
}
