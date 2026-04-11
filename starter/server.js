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

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
