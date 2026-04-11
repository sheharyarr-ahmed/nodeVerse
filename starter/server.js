const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/config.env` });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then((connection) => {
    const password = process.env.DATABASE_PASSWORD || '';

    console.log('DB connection successful');
    console.log({
      host: connection.connection.host,
      port: connection.connection.port,
      name: connection.connection.name,
      readyState: connection.connection.readyState,
      password: password ? `${'*'.repeat(password.length)}` : undefined,
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
  });

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },

  rating: {
    type: Number,
    default: 4.5,
  },

  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'the forest hiker',
  rating: 4.7,
  price: 497,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('ERROR: ', err);
  });

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
