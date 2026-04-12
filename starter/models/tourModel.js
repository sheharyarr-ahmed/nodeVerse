const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, 'A tour name must have at least 10 characters'],
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      validate: {
        validator: function (val) {
          return /^[a-zA-Z\s'-]+$/.test(val);
        },
        message:
          'A tour name can only contain letters, spaces, apostrophes, and hyphens',
      },
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
      min: [1, 'A tour must have a duration of at least 1 day'],
      max: [30, 'A tour must have a duration of 30 days or less'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
      min: [1, 'A tour group must have at least 1 person'],
      max: [50, 'A tour group must have 50 people or fewer'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above or equal to 1.0'],
      max: [5, 'Rating must be below or equal to 5.0'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Ratings quantity cannot be negative'],
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      min: [1, 'A tour must have a price above 0'],
    },

    priceDiscount: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
      minlength: [10, 'A tour summary must have at least 10 characters'],
      maxlength: [
        250,
        'A tour summary must have less or equal than 250 characters',
      ],
    },

    description: {
      type: String,
      trim: true,
      minlength: [20, 'A tour description must have at least 20 characters'],
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
      trim: true,
      minlength: [5, 'A cover image filename must have at least 5 characters'],
    },

    images: {
      type: [String],
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
