import express from 'express';
import {
  getAttractions, createAttraction,
  getHotels, createHotel,
  getRestaurants, createRestaurant,
  getSavedPlaces, savePlace, removeSavedPlace,
} from '../controllers/placeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public read endpoints
router.get('/attractions', getAttractions);
router.get('/hotels', getHotels);
router.get('/restaurants', getRestaurants);

// Admin endpoints
router.post('/attractions', protect, authorize('admin', 'moderator'), createAttraction);
router.post('/hotels', protect, authorize('admin', 'moderator'), createHotel);
router.post('/restaurants', protect, authorize('admin', 'moderator'), createRestaurant);

// Saved Places (User Protected)
router.get('/saved', protect, getSavedPlaces);
router.post('/saved', protect, savePlace);
router.delete('/saved/:id', protect, removeSavedPlace);

export default router;
