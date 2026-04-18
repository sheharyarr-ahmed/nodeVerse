const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here'
  ) {
    return next(new AppError('Stripe is not configured.', 500));
  }

  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID.', 404));
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.getAllBookings = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined.',
  });
};
