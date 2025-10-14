'use strict';

const express = require('express');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const mailRoutes = require('./routes/mailRoutes');

const app = express();
const port = 3000;

sequelize
  .sync({ force: true })
  /* eslint-disable no-console */
  .then(() => console.log('Database synced'))
  /* eslint-disable no-console */
  .catch((err) => console.log('Error syncing database:', err));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', authRoutes);
app.use('/mail', mailRoutes);

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Server is listening on port ${port}`);
});
