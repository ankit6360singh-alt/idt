// Budget Optimization Engine
// Smart budget allocation across different categories

export const optimizeBudget = (params) => {
    const { totalBudget, days, travelerType, destination } = params

    // Base allocation percentages
    let allocation = {
        accommodation: 0.35,  // 35%
        food: 0.25,           // 25%
        transport: 0.15,      // 15%
        attractions: 0.20,    // 20%
        miscellaneous: 0.05   // 5%
    }

    // Adjust based on traveler type
    allocation = adjustForTravelerType(allocation, travelerType)

    // Calculate actual amounts
    const safeTotal = Number(totalBudget) || 5000
    const breakdown = {
        accommodation: Math.floor(safeTotal * (allocation.accommodation || 0.2)),
        food: Math.floor(safeTotal * (allocation.food || 0.2)),
        transport: Math.floor(safeTotal * (allocation.transport || 0.2)),
        attractions: Math.floor(safeTotal * (allocation.attractions || 0.2)),
        miscellaneous: Math.floor(safeTotal * (allocation.miscellaneous || 0.2))
    }

    // Ensure total matches (handle rounding)
    const calculatedTotal = Object.values(breakdown).reduce((a, b) => a + b, 0)
    if (calculatedTotal < safeTotal) {
        breakdown.miscellaneous += (safeTotal - calculatedTotal)
    }

    breakdown.total = safeTotal

    return {
        ...breakdown,
        perDayEstimate: Math.floor(safeTotal / (Number(days) || 1)),
        recommendations: getBudgetRecommendations(breakdown, days, travelerType)
    }
}

const adjustForTravelerType = (allocation, travelerType) => {
    const adjustments = {
        solo: {
            accommodation: 0.30,  // Lower accommodation (hostels/budget hotels)
            food: 0.25,
            transport: 0.20,      // Higher transport (more mobility)
            attractions: 0.20,
            miscellaneous: 0.05
        },
        family: {
            accommodation: 0.40,  // Higher accommodation (family rooms)
            food: 0.30,           // Higher food (more people)
            transport: 0.15,
            attractions: 0.10,    // Lower attractions (some free activities)
            miscellaneous: 0.05
        },
        friends: {
            accommodation: 0.30,  // Shared accommodation
            food: 0.25,
            transport: 0.15,
            attractions: 0.25,    // More activities
            miscellaneous: 0.05
        },
        couple: {
            accommodation: 0.35,
            food: 0.30,           // Romantic dining
            transport: 0.15,
            attractions: 0.15,
            miscellaneous: 0.05
        },
        women: {
            accommodation: 0.40,  // Safe, quality accommodation
            food: 0.25,
            transport: 0.20,      // Safe transport options
            attractions: 0.10,
            miscellaneous: 0.05
        }
    }

    return adjustments[travelerType] || allocation
}

const getBudgetRecommendations = (breakdown, days, travelerType) => {
    const recommendations = []

    const perDayFood = breakdown.food / days
    const perDayAccommodation = breakdown.accommodation / days

    // Accommodation recommendations
    if (perDayAccommodation < 1500) {
        recommendations.push('Consider budget hotels or hostels for accommodation')
    } else if (perDayAccommodation > 3000) {
        recommendations.push('You can afford mid-range to premium hotels')
    }

    // Food recommendations
    if (perDayFood < 800) {
        recommendations.push('Mix of local street food and budget restaurants recommended')
    } else {
        recommendations.push('You can enjoy a mix of local and fine dining experiences')
    }

    // Traveler-specific tips
    if (travelerType === 'family') {
        recommendations.push('Look for family packages and group discounts')
    } else if (travelerType === 'women') {
        recommendations.push('Prioritize safety - invest in reputable accommodations and transport')
    } else if (travelerType === 'solo') {
        recommendations.push('Consider shared tours to save on transport costs')
    }

    // General tips
    recommendations.push('Book attractions online in advance for discounts')
    recommendations.push('Keep 10-15% buffer for unexpected expenses')

    return recommendations
}

export const calculateDailyCosts = (itinerary) => {
    return itinerary.map(day => {
        const dailyTotal = day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0)
        return {
            day: day.day,
            total: dailyTotal,
            breakdown: day.activities.map(a => ({
                activity: a.title,
                cost: a.cost
            }))
        }
    })
}
