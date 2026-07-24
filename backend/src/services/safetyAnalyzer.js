// Safety & Crowd Analysis Module
// Analyzes safety scores and crowd levels for destinations

export const analyzeSafety = (params) => {
    const { destination, travelerType, timeOfDay } = params

    // Base safety score (would come from real data/APIs in production)
    let safetyScore = 75

    // Destination-specific adjustments
    const destinationSafety = {
        'jaipur': 85,
        'goa': 80,
        'delhi': 75,
        'mumbai': 78,
        'bangalore': 82,
        'kerala': 88
    }

    const destKey = destination.toLowerCase().trim()
    safetyScore = destinationSafety[destKey] || 75

    // Time-based adjustments
    if (timeOfDay === 'night') {
        safetyScore -= 10
    } else if (timeOfDay === 'evening') {
        safetyScore -= 5
    }

    // Traveler type adjustments
    if (travelerType === 'women') {
        // Enhanced safety filtering for women travelers
        safetyScore = Math.max(70, safetyScore) // Minimum threshold

        return {
            safetyScore,
            safetyLevel: getSafetyLevel(safetyScore),
            safetyTips: getWomenSafetyTips(destination),
            safeZones: getSafeZones(destination),
            emergencyContacts: getEmergencyContacts(destination)
        }
    }

    return {
        safetyScore,
        safetyLevel: getSafetyLevel(safetyScore),
        safetyTips: getGeneralSafetyTips(destination, travelerType),
        safeZones: getSafeZones(destination)
    }
}

const getSafetyLevel = (score) => {
    if (score >= 85) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 65) return 'Moderate'
    return 'Caution Advised'
}

const getWomenSafetyTips = (destination) => {
    return [
        'Share your itinerary with trusted contacts',
        'Use registered taxis or ride-sharing apps',
        'Avoid isolated areas, especially after dark',
        'Keep emergency numbers saved and easily accessible',
        'Stay in well-reviewed accommodations in safe neighborhoods',
        'Trust your instincts - if something feels wrong, leave',
        'Dress modestly to respect local customs',
        'Keep valuables secure and avoid displaying expensive items'
    ]
}

const getGeneralSafetyTips = (destination, travelerType) => {
    const tips = [
        'Keep copies of important documents',
        'Be aware of your surroundings',
        'Use hotel safes for valuables',
        'Avoid displaying expensive items',
        'Stay in well-lit, populated areas at night'
    ]

    if (travelerType === 'solo') {
        tips.push('Inform someone about your daily plans')
        tips.push('Join group tours for popular attractions')
    } else if (travelerType === 'family') {
        tips.push('Keep children close in crowded areas')
        tips.push('Have a meeting point in case of separation')
    }

    return tips
}

const getSafeZones = (destination) => {
    // In production, this would use real location data
    return [
        `${destination} City Center`,
        `${destination} Tourist District`,
        `${destination} Hotel Zone`,
        'Major Shopping Areas',
        'Government Protected Sites'
    ]
}

const getEmergencyContacts = (destination) => {
    return {
        police: '100',
        ambulance: '108',
        womenHelpline: '1091',
        touristHelpline: '1363',
        localPoliceStation: `${destination} Central Police Station`
    }
}

export const analyzeCrowdLevel = (params) => {
    const { destination, season, dayOfWeek } = params

    let crowdScore = 50 // Base: moderate

    // Season adjustments
    if (season === 'peak' || season === 'winter') {
        crowdScore += 20
    } else if (season === 'off-season') {
        crowdScore -= 20
    }

    // Day of week
    if (dayOfWeek === 'weekend') {
        crowdScore += 15
    }

    // Destination popularity
    const popularDestinations = ['goa', 'delhi', 'mumbai', 'jaipur']
    if (popularDestinations.includes(destination.toLowerCase())) {
        crowdScore += 10
    }

    crowdScore = Math.max(0, Math.min(100, crowdScore))

    return {
        crowdScore,
        crowdLevel: getCrowdLevel(crowdScore),
        bestTimesToVisit: getBestVisitTimes(crowdScore),
        crowdAvoidanceTips: getCrowdAvoidanceTips()
    }
}

const getCrowdLevel = (score) => {
    if (score >= 80) return 'Very High'
    if (score >= 60) return 'High'
    if (score >= 40) return 'Moderate'
    return 'Low'
}

const getBestVisitTimes = (crowdScore) => {
    if (crowdScore >= 70) {
        return ['Early morning (6-8 AM)', 'Late evening (after 6 PM)', 'Weekdays']
    }
    return ['Anytime during the day', 'Flexible timing']
}

const getCrowdAvoidanceTips = () => {
    return [
        'Visit popular attractions early morning or late evening',
        'Book tickets online to skip queues',
        'Consider visiting on weekdays',
        'Explore lesser-known local spots',
        'Use off-peak transportation times'
    ]
}
