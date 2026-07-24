import Attraction from '../models/Attraction.js';
import Hotel from '../models/Hotel.js';
import Restaurant from '../models/Restaurant.js';
import SavedPlace from '../models/SavedPlace.js';

// --- ATTRACTIONS ---
export const getAttractions = async (req, res, next) => {
  try {
    const { destination, category, page = 1, limit = 10 } = req.query;
    const query = {};
    if (destination) query.destination = destination;
    if (category) query.category = category;

    const data = await Attraction.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await Attraction.countDocuments(query);

    res.status(200).json({ success: true, count: data.length, total, data });
  } catch (error) {
    next(error);
  }
};

export const createAttraction = async (req, res, next) => {
  try {
    const item = await Attraction.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// --- HOTELS ---
export const getHotels = async (req, res, next) => {
  try {
    const { destination, priceRange, minRating, page = 1, limit = 10 } = req.query;
    const query = {};
    if (destination) query.destination = destination;
    if (priceRange) query.priceRange = priceRange;
    if (minRating) query.rating = { $gte: Number(minRating) };

    const data = await Hotel.find(query)
      .sort('-rating')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await Hotel.countDocuments(query);

    res.status(200).json({ success: true, count: data.length, total, data });
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req, res, next) => {
  try {
    const item = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// --- RESTAURANTS ---
export const getRestaurants = async (req, res, next) => {
  try {
    const { destination, cuisine, priceRange, page = 1, limit = 10 } = req.query;
    const query = {};
    if (destination) query.destination = destination;
    if (cuisine) query.cuisine = new RegExp(cuisine, 'i');
    if (priceRange) query.priceRange = priceRange;

    const data = await Restaurant.find(query)
      .sort('-rating')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await Restaurant.countDocuments(query);

    res.status(200).json({ success: true, count: data.length, total, data });
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (req, res, next) => {
  try {
    const item = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// --- SAVED PLACES ---
export const getSavedPlaces = async (req, res, next) => {
  try {
    const places = await SavedPlace.find({ user: req.user._id })
      .populate('destination')
      .populate('placeId')
      .sort('-savedDate')
      .lean();

    res.status(200).json({ success: true, count: places.length, data: places });
  } catch (error) {
    next(error);
  }
};

export const savePlace = async (req, res, next) => {
  try {
    const { destination, placeType, placeId, placeModel, notes } = req.body;
    const item = await SavedPlace.create({
      user: req.user._id,
      destination,
      placeType,
      placeId,
      placeModel,
      notes,
    });
    res.status(201).json({ success: true, message: 'Place saved to bookmarks', data: item });
  } catch (error) {
    next(error);
  }
};

export const removeSavedPlace = async (req, res, next) => {
  try {
    await SavedPlace.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.status(200).json({ success: true, message: 'Saved place removed' });
  } catch (error) {
    next(error);
  }
};
