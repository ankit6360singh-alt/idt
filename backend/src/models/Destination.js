import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      index: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Location coordinates [longitude, latitude] are required'],
      },
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['city', 'beach', 'mountain', 'historical', 'nature', 'cultural', 'adventure', 'island'],
      required: [true, 'Category is required'],
      index: true,
    },
    averageCostPerDay: {
      type: Number,
      required: [true, 'Average cost per day is required'],
      min: [0, 'Average cost cannot be negative'],
    },
    bestTimeToVisit: {
      type: String,
      required: [true, 'Best time to visit info is required'],
    },
    popularAttractions: [
      {
        type: String,
      },
    ],
    weatherInfo: {
      tempRange: { type: String, default: '20°C - 30°C' },
      bestMonths: [String],
      climateType: { type: String, default: 'Tropical' },
    },
    safetyScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 8,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
      index: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    nearbyCities: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
destinationSchema.index({ location: '2dsphere' });
destinationSchema.index({ country: 1, category: 1 });
destinationSchema.index({ name: 'text', country: 'text', description: 'text', tags: 'text' });

const Destination = mongoose.models.Destination || mongoose.model('Destination', destinationSchema);
export default Destination;
