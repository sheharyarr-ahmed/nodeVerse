const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: `${__dirname}/config.env` });

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

const tours = fs.readFileSync('tours-simple.json', 'utf-8');

const imortData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
};
