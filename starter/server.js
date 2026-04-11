const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/config.env` });

const app = require('./app');

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('DB connection successful (Atlas)'));

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
