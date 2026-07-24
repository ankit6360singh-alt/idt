// Google Directions API Service
// Calculates routes, distances, and travel times

import { Client } from '@googlemaps/google-maps-services-js'

const client = new Client({})
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'demo_key'

/**
 * Get directions between two points
 */
export const getDirections = async ({ origin, destination, mode = 'driving', waypoints = [] }) => {
    try {
        const params = {
            origin,
            destination,
            mode,
            key: GOOGLE_MAPS_API_KEY
        }

        if (waypoints.length > 0) {
            params.waypoints = waypoints
            params.optimize_waypoints = true
        }

        const response = await client.directions({ params })

        if (!response.data.routes.length) {
            return null
        }

        const route = response.data.routes[0]
        const leg = route.legs[0]

        return {
            distance: leg.distance.text,
            distanceValue: leg.distance.value, // in meters
            duration: leg.duration.text,
            durationValue: leg.duration.value, // in seconds
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps.map(step => ({
                instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
                distance: step.distance.text,
                duration: step.duration.text,
                travelMode: step.travel_mode
            })),
            polyline: route.overview_polyline.points,
            waypointOrder: route.waypoint_order
        }
    } catch (error) {
        console.error('Directions API error:', error.message)
        return null
    }
}

/**
 * Calculate distance matrix between multiple origins and destinations
 */
export const getDistanceMatrix = async ({ origins, destinations, mode = 'driving' }) => {
    try {
        const response = await client.distanceMatrix({
            params: {
                origins,
                destinations,
                mode,
                key: GOOGLE_MAPS_API_KEY
            }
        })

        return response.data.rows.map((row, i) => ({
            origin: origins[i],
            destinations: row.elements.map((element, j) => ({
                destination: destinations[j],
                distance: element.distance?.text,
                distanceValue: element.distance?.value,
                duration: element.duration?.text,
                durationValue: element.duration?.value,
                status: element.status
            }))
        }))
    } catch (error) {
        console.error('Distance matrix error:', error.message)
        return []
    }
}

/**
 * Optimize route for multiple waypoints
 */
export const optimizeRoute = async (locations, mode = 'driving') => {
    if (locations.length < 2) {
        return { locations, totalDistance: 0, totalDuration: 0 }
    }

    try {
        const origin = locations[0]
        const destination = locations[locations.length - 1]
        const waypoints = locations.slice(1, -1)

        const directions = await getDirections({
            origin,
            destination,
            mode,
            waypoints
        })

        if (!directions) {
            return { locations, totalDistance: 0, totalDuration: 0 }
        }

        // Reorder waypoints based on optimization
        const optimizedWaypoints = directions.waypointOrder.map(i => waypoints[i])
        const optimizedLocations = [origin, ...optimizedWaypoints, destination]

        return {
            locations: optimizedLocations,
            totalDistance: directions.distanceValue,
            totalDuration: directions.durationValue,
            polyline: directions.polyline
        }
    } catch (error) {
        console.error('Route optimization error:', error.message)
        return { locations, totalDistance: 0, totalDuration: 0 }
    }
}

/**
 * Get travel time between two points
 */
export const getTravelTime = async ({ origin, destination, mode = 'driving', departureTime = 'now' }) => {
    try {
        const params = {
            origin,
            destination,
            mode,
            key: GOOGLE_MAPS_API_KEY
        }

        if (departureTime !== 'now') {
            params.departure_time = departureTime
        }

        const response = await client.directions({ params })

        if (!response.data.routes.length) {
            return null
        }

        const leg = response.data.routes[0].legs[0]

        return {
            distance: leg.distance.text,
            distanceValue: leg.distance.value,
            duration: leg.duration.text,
            durationValue: leg.duration.value,
            durationInTraffic: leg.duration_in_traffic?.text,
            durationInTrafficValue: leg.duration_in_traffic?.value
        }
    } catch (error) {
        console.error('Travel time error:', error.message)
        return null
    }
}

/**
 * Calculate total itinerary travel time
 */
export const calculateItineraryTravelTime = async (activities) => {
    if (activities.length < 2) {
        return 0
    }

    let totalTime = 0

    for (let i = 0; i < activities.length - 1; i++) {
        const current = activities[i]
        const next = activities[i + 1]

        if (!current.location || !next.location) continue

        const travelTime = await getTravelTime({
            origin: `${current.location.lat},${current.location.lng}`,
            destination: `${next.location.lat},${next.location.lng}`,
            mode: 'driving'
        })

        if (travelTime) {
            totalTime += travelTime.durationValue
        }
    }

    return totalTime // in seconds
}

/**
 * Get Google Maps URL for directions
 */
export const getGoogleMapsUrl = ({ origin, destination, travelMode = 'driving' }) => {
    const baseUrl = 'https://www.google.com/maps/dir/?api=1'
    const params = new URLSearchParams({
        origin,
        destination,
        travelmode: travelMode
    })

    return `${baseUrl}&${params.toString()}`
}

/**
 * Get multiple transport mode options
 */
export const getMultiModalDirections = async ({ origin, destination }) => {
    const modes = ['driving', 'walking', 'transit', 'bicycling']
    const results = {}

    for (const mode of modes) {
        const directions = await getDirections({ origin, destination, mode })
        if (directions) {
            results[mode] = {
                distance: directions.distance,
                duration: directions.duration,
                distanceValue: directions.distanceValue,
                durationValue: directions.durationValue
            }
        }
    }

    return results
}
