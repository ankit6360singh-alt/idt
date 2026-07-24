import Destination from '../models/Destination.js';
import Attraction from '../models/Attraction.js';
import Hotel from '../models/Hotel.js';
import Restaurant from '../models/Restaurant.js';

export const getDestinations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category, country, minRating, sort = '-rating' } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (country) {
      query.country = new RegExp(country, 'i');
    }
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const destinations = await Destination.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Destination.countDocuments(query);

    res.status(200).json({
      success: true,
      count: destinations.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

export const getDestinationById = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    const attractions = await Attraction.find({ destination: destination._id }).limit(10).lean();
    const hotels = await Hotel.find({ destination: destination._id }).limit(10).lean();
    const restaurants = await Restaurant.find({ destination: destination._id }).limit(10).lean();

    res.status(200).json({
      success: true,
      data: {
        ...destination.toObject(),
        attractions,
        hotels,
        restaurants,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDestination = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyDestinations = async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 50000 } = req.query; // maxDistance in meters (default 50km)

    if (!lng || !lat) {
      return res.status(400).json({ success: false, error: 'Longitude (lng) and Latitude (lat) are required' });
    }

    const destinations = await Destination.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: 'distanceInMeters',
          maxDistance: parseInt(maxDistance),
          spherical: true,
        },
      },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};
