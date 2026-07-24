import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination ID is required'],
      index: true,
    },
    restaurantName: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    cuisine: [
      {
        type: String,
        trim: true,
      },
    ],
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.2,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    images: [String],
    openingHours: {
      type: String,
      default: '11:00 AM - 11:00 PM',
    },
    contactNumber: String,
    website: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ destination: 1, cuisine: 1 });

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
