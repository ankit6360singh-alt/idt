import express from 'express';
import {
  getReviews, createReview,
  getNotifications, markNotificationRead,
  getWeather,
  getChatHistory, saveChatMessage,
} from '../controllers/interactionController.js';
import { protect } from '../middleware/auth.js';
import { reviewValidator } from '../validators/index.js';

const router = express.Router();

// Reviews
router.get('/reviews', getReviews);
router.post('/reviews', protect, reviewValidator, createReview);

// Weather
router.get('/weather/:location', getWeather);

// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

// Chat History
router.get('/chat', protect, getChatHistory);
router.post('/chat', protect, saveChatMessage);

export default router;
