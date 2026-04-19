const slugify = require('slugify');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getBase = (req, res) => {
  res.status(200).render('base', {
    title: 'Natours',
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = catchAsync(async (req, res) => {
  if (!res.locals.user) {
    return res.redirect('/login');
  }

  const bookings = await Booking.find({ user: res.locals.user.id });
  const tours = bookings.map((booking) => booking.tour).filter(Boolean);

  tours.forEach((tour) => {
    if (!tour.slug) tour.slug = slugify(tour.name, { lower: true });
  });

  res.status(200).render('account', {
    title: 'Your account',
    tours,
  });
});

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  tours.forEach((tour) => {
    if (!tour.slug) tour.slug = slugify(tour.name, { lower: true });
  });

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getHome = exports.getOverview;

exports.getTour = catchAsync(async (req, res, next) => {
  let tour = await Tour.findOne({ slug: req.params.slug })
    .select('+images')
    .populate('reviews');

  if (!tour) {
    const tours = await Tour.find().select('+images').populate('reviews');
    tour = tours.find(
      (currentTour) =>
        slugify(currentTour.name, { lower: true }) === req.params.slug,
    );
  }

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});
