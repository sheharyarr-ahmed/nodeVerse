const Tour = require('../models/tourModel');

const allowedOperators = ['gte', 'gt', 'lte', 'lt'];
const allowedSortFields = [
  'name',
  'price',
  'ratings',
  'ratingsAverage',
  'ratingsQuantity',
  'duration',
  'difficulty',
  'maxGroupSize',
  'createdAt',
];
const allowedSelectFields = [
  'name',
  'duration',
  'maxGroupSize',
  'difficulty',
  'ratingsAverage',
  'ratingsQuantity',
  'price',
  'priceDiscount',
  'summary',
  'description',
  'imageCover',
  'images',
  'createdAt',
  'startDates',
];

const normalizeSortField = (field) => {
  const direction = field.startsWith('-') ? '-' : '';
  const fieldName = field.replace(/^-/, '');

  if (!allowedSortFields.includes(fieldName)) return null;

  return `${direction}${fieldName === 'ratings' ? 'ratingsAverage' : fieldName}`;
};

const normalizeSelectField = (field) => {
  if (!allowedSelectFields.includes(field)) return null;

  return field === 'images' ? '+images' : field;
};

const getPaginationOptions = (queryString) => {
  const page = queryString.page * 1 || 1;
  const requestedLimit = queryString.limit * 1 || 10;
  const limit = Math.min(requestedLimit, 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildToursQuery = (queryString) => {
  const queryObj = { ...queryString };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((field) => delete queryObj[field]);

  let query = Tour.find();

  Object.entries(queryObj).forEach(([field, value]) => {
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([operator, operatorValue]) => {
        if (!allowedOperators.includes(operator)) return;

        query = query.where(field)[operator](operatorValue);
      });
    } else {
      query = query.where(field).equals(value);
    }
  });

  if (queryString.sort) {
    const sortBy = queryString.sort
      .split(',')
      .map(normalizeSortField)
      .filter(Boolean)
      .join(' ');

    query = query.sort(sortBy || '-createdAt');
  } else {
    query = query.sort('-createdAt');
  }

  if (queryString.fields) {
    const fields = queryString.fields
      .split(',')
      .map(normalizeSelectField)
      .filter(Boolean)
      .join(' ');

    query = query.select(fields || '-__v');
  } else {
    query = query.select('-__v');
  }

  const { limit, skip } = getPaginationOptions(queryString);

  return query.skip(skip).limit(limit);
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }

  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const { page, skip } = getPaginationOptions(req.query);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();

      if (skip >= numTours) {
        return res.status(404).json({
          status: 'fail',
          message: `Page ${page} does not exist`,
        });
      }
    }

    const tours = await buildToursQuery(req.query);

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
