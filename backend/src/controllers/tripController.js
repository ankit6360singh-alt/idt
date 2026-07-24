import Trip from '../models/Trip.js';
import User from '../models/User.js';

export const createTrip = async (req, res, next) => {
  try {
    const tripData = {
      ...req.body,
      user: req.user._id,
    };

    const trip = await Trip.create(tripData);

    // Link trip to user's createdTrips
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdTrips: trip._id },
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, destination, sort = '-createdAt' } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;
    if (destination) query.destination = new RegExp(destination, 'i');

    const trips = await Trip.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('destinationId');

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin' && !trip.isPublic) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this trip' });
    }

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this trip' });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this trip' });
    }

    await trip.deleteOne();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdTrips: req.params.id, savedTrips: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
