import mongoose from 'mongoose';

const weatherCacheSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: [true, 'Location is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    temperature: {
      current: { type: Number, required: true },
      min: Number,
      max: Number,
      unit: { type: String, default: 'Celsius' },
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100,
    },
    windSpeed: {
      type: Number,
      min: 0,
    },
    forecast: [
      {
        day: String,
        temp: Number,
        condition: String,
        icon: String,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 3 * 60 * 60 * 1000), // Default 3 hours TTL
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index: Automatically removes documents when `expiresAt` time is reached
weatherCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const WeatherCache = mongoose.models.WeatherCache || mongoose.model('WeatherCache', weatherCacheSchema);
export default WeatherCache;
