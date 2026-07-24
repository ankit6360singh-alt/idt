import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import WeatherCache from '../models/WeatherCache.js';
import ChatHistory from '../models/ChatHistory.js';
import Destination from '../models/Destination.js';

// --- REVIEWS ---
export const getReviews = async (req, res, next) => {
  try {
    const { destination, trip, page = 1, limit = 10 } = req.query;
    const query = {};
    if (destination) query.destination = destination;
    if (trip) query.trip = trip;

    const reviews = await Review.find(query)
      .populate('user', 'fullName profilePicture username')
      .sort('-createdDate')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Review.countDocuments(query);

    res.status(200).json({ success: true, count: reviews.length, total, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { destination, trip, rating, review, images } = req.body;
    const item = await Review.create({
      user: req.user._id,
      destination,
      trip,
      rating,
      review,
      images,
    });

    // Update Destination average rating if destination review
    if (destination) {
      const stats = await Review.aggregate([
        { $match: { destination: item.destination } },
        { $group: { _id: '$destination', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);

      if (stats.length > 0) {
        await Destination.findByIdAndUpdate(destination, {
          rating: Number(stats[0].avgRating.toFixed(1)),
          totalReviews: stats[0].count,
        });
      }
    }

    res.status(201).json({ success: true, message: 'Review added', data: item });
  } catch (error) {
    next(error);
  }
};

// --- NOTIFICATIONS ---
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdDate')
      .limit(20)
      .lean();

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { readStatus: true });
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

// --- WEATHER CACHE ---
export const getWeather = async (req, res, next) => {
  try {
    const { location } = req.params;
    const cached = await WeatherCache.findOne({ location: location.toLowerCase() });

    if (cached) {
      return res.status(200).json({ success: true, source: 'cache', data: cached });
    }

    // Mock fresh weather creation if cache miss
    const freshWeather = await WeatherCache.create({
      location: location.toLowerCase(),
      temperature: { current: Math.floor(Math.random() * 15) + 20, min: 18, max: 32 },
      humidity: 65,
      windSpeed: 12,
      forecast: [
        { day: 'Mon', temp: 28, condition: 'Sunny' },
        { day: 'Tue', temp: 26, condition: 'Partly Cloudy' },
        { day: 'Wed', temp: 27, condition: 'Clear' },
      ],
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // Expires in 3 hours
    });

    res.status(200).json({ success: true, source: 'fresh', data: freshWeather });
  } catch (error) {
    next(error);
  }
};

// --- CHAT HISTORY ---
export const getChatHistory = async (req, res, next) => {
  try {
    const { conversationId } = req.query;
    const query = { user: req.user._id };
    if (conversationId) query.conversationId = conversationId;

    const chats = await ChatHistory.find(query).sort('-timestamp').limit(50).lean();
    res.status(200).json({ success: true, count: chats.length, data: chats });
  } catch (error) {
    next(error);
  }
};

export const saveChatMessage = async (req, res, next) => {
  try {
    const { conversationId, prompt, response, title, metadata } = req.body;
    const chat = await ChatHistory.create({
      user: req.user._id,
      conversationId: conversationId || `conv_${Date.now()}`,
      title: title || 'Travel Assistant Chat',
      prompt,
      response,
      metadata,
    });
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};
