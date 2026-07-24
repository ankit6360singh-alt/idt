import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import tripRoutes from './src/routes/tripRoutes.js';
import destinationRoutes from './src/routes/destinationRoutes.js';
import placeRoutes from './src/routes/placeRoutes.js';
import interactionRoutes from './src/routes/interactionRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import userTripRoutes from './src/routes/userTripRoutes.js';
import { errorHandler } from './src/middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with full HTTP method and headers support for cross-origin preflight requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', cors());

app.use(express.json());

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Connect MongoDB Atlas Database
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.warn('⚠️ MONGODB_URI not found in env. Running in demo mode.');
}

// API Routes (Supporting both singular /api/trip and plural /api/trips)
app.use('/api/auth', authRoutes);
app.use('/api/trip', tripRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/user', userTripRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/chat', chatRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TRAVLO Production Backend API',
    timestamp: new Date().toISOString(),
    database: {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host || 'Disconnected',
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 TRAVLO Production Backend running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
