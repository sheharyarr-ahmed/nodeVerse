const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next();
});

const getHome = (req, res) => {
  res.status(200).json({
    message: 'Hello from the server side!',
    app: 'natours',
    toursUrl: '/api/v1/tours',
  });
};

app.get('/', getHome);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
