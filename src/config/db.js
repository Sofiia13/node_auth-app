const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('node_auth_db', 'sofia', 'mypassword', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    /* eslint-disable no-console */
    console.log('Database connection has been established successfully.');
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;
