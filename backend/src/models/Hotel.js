import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination ID is required'],
      index: true,
    },
    hotelName: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    priceRange: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'resort'],
      required: true,
      index: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
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
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    bookingUrl: String,
    contactInfo: {
      phone: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ destination: 1, priceRange: 1 });
hotelSchema.index({ rating: -1 });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
export default Hotel;
