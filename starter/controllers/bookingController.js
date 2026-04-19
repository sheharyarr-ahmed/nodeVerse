const stripe = require('stripe');

const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const createBookingFromSession = async (session) => {
  const tour = session.client_reference_id;
  const customer = await User.findOne({ email: session.customer_email });

  if (!customer) {
    throw new Error(`No user found for ${session.customer_email}`);
  }

  const user = customer.id;
  const price = session.amount_total / 100;

  await Booking.findOneAndUpdate(
    { tour, user },
    { tour, user, price, paid: true },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
};

exports.webhookCheckout = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

    event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    res.status(200).json({ received: true });

    createBookingFromSession(event.data.object)
      .then(() => {
        console.log(
          `Booking created from Stripe checkout session ${event.data.object.id}`,
        );
      })
      .catch((err) => {
        console.error('Stripe webhook booking creation failed:', err);
      });

    return;
  }

  res.status(200).json({ received: true });
};

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.findOneAndUpdate(
    { tour, user },
    { tour, user, price, paid: true },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  res.redirect(req.path);
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here'
  ) {
    return next(new AppError('Stripe is not configured.', 500));
  }

  const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID.', 404));
  }

  const session = await stripeClient.checkout.sessions.create({
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

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
