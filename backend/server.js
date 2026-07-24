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
import { errorHandler } from './src/middleware/error.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json());

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 mins
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', limiter);

// Connect MongoDB Atlas Database
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.warn('⚠️ MONGODB_URI not found in env. Running in demo mode.');
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
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

app.listen(PORT, () => {
  console.log(`🚀 TRAVLO Production Backend running on port ${PORT}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
});
