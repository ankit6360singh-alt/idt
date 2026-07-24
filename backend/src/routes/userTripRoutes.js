// User Trip Management Routes
// Save, retrieve, and manage user trips

import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import Trip from '../models/Trip.js'
import User from '../models/User.js'

const router = express.Router()

/**
 * POST /api/user/trips/save
 * Save a trip to user account
 */
router.post('/trips/save', authenticate, async (req, res) => {
    try {
        const { tripData } = req.body

        // Create trip with user reference
        const trip = new Trip({
            ...tripData,
            userId: req.userId
        })

        await trip.save()

        // Add to user's saved trips
        await User.findByIdAndUpdate(req.userId, {
            $push: { savedTrips: trip._id }
        })

        res.status(201).json({
            message: 'Trip saved successfully',
            trip
        })
    } catch (error) {
        console.error('Save trip error:', error)
        res.status(500).json({ error: 'Failed to save trip' })
    }
})

/**
 * GET /api/user/trips
 * Get all saved trips for user
 */
router.get('/trips', authenticate, async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.userId })
            .sort({ createdAt: -1 })

        res.json({ trips })
    } catch (error) {
        console.error('Get trips error:', error)
        res.status(500).json({ error: 'Failed to get trips' })
    }
})

/**
 * GET /api/user/trips/:id
 * Get specific trip
 */
router.get('/trips/:id', authenticate, async (req, res) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.id,
            userId: req.userId
        })

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' })
        }

        res.json({ trip })
    } catch (error) {
        console.error('Get trip error:', error)
        res.status(500).json({ error: 'Failed to get trip' })
    }
})

/**
 * DELETE /api/user/trips/:id
 * Delete a saved trip
 */
router.delete('/trips/:id', authenticate, async (req, res) => {
    try {
        const trip = await Trip.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        })

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' })
        }

        // Remove from user's saved trips
        await User.findByIdAndUpdate(req.userId, {
            $pull: { savedTrips: trip._id }
        })

        res.json({ message: 'Trip deleted successfully' })
    } catch (error) {
        console.error('Delete trip error:', error)
        res.status(500).json({ error: 'Failed to delete trip' })
    }
})

/**
 * POST /api/user/favorites
 * Add a place to favorites
 */
router.post('/favorites', authenticate, async (req, res) => {
    try {
        const { placeId, placeName, placeType } = req.body

        const user = await User.findById(req.userId)

        if (!user.favorites) {
            user.favorites = []
        }

        // Check if already favorited
        const exists = user.favorites.some(fav => fav.placeId === placeId)
        if (exists) {
            return res.status(400).json({ error: 'Place already in favorites' })
        }

        user.favorites.push({ placeId, placeName, placeType })
        await user.save()

        res.json({ message: 'Added to favorites', favorites: user.favorites })
    } catch (error) {
        console.error('Add favorite error:', error)
        res.status(500).json({ error: 'Failed to add favorite' })
    }
})

/**
 * GET /api/user/favorites
 * Get user's favorite places
 */
router.get('/favorites', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('favorites')
        res.json({ favorites: user.favorites || [] })
    } catch (error) {
        console.error('Get favorites error:', error)
        res.status(500).json({ error: 'Failed to get favorites' })
    }
})

/**
 * DELETE /api/user/favorites/:placeId
 * Remove from favorites
 */
router.delete('/favorites/:placeId', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId)

        user.favorites = user.favorites.filter(
            fav => fav.placeId !== req.params.placeId
        )

        await user.save()

        res.json({ message: 'Removed from favorites', favorites: user.favorites })
    } catch (error) {
        console.error('Remove favorite error:', error)
        res.status(500).json({ error: 'Failed to remove favorite' })
    }
})

export default router
