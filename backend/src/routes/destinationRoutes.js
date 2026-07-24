import express from 'express';
import {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  getNearbyDestinations,
} from '../controllers/destinationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { destinationValidator } from '../validators/index.js';

const router = express.Router();

router.get('/nearby', getNearbyDestinations);

router.route('/')
  .get(getDestinations)
  .post(protect, authorize('admin', 'moderator'), destinationValidator, createDestination);

router.route('/:id')
  .get(getDestinationById)
  .put(protect, authorize('admin', 'moderator'), updateDestination)
  .delete(protect, authorize('admin'), deleteDestination);

export default router;
