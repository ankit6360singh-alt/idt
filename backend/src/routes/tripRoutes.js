import express from 'express';
import { createTrip, getTrips, getTripById, updateTrip, deleteTrip } from '../controllers/tripController.js';
import { protect } from '../middleware/auth.js';
import { tripValidator } from '../validators/index.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(tripValidator, createTrip)
  .get(getTrips);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

export default router;
