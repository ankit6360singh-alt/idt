// Authentication Middleware
// Verifies JWT tokens and protects routes

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production'

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '')

        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' })
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET)

        // Find user
        const user = await User.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({ error: 'User not found' })
        }

        // Attach user to request
        req.user = user
        req.userId = user._id
        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' })
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' })
        }
        res.status(500).json({ error: 'Authentication failed' })
    }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '')

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET)
            const user = await User.findById(decoded.userId)
            if (user) {
                req.user = user
                req.userId = user._id
            }
        }
        next()
    } catch (error) {
        // Continue without authentication
        next()
    }
}

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
    const expiresIn = process.env.JWT_EXPIRE || '7d'
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn })
}
