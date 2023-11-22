require('dotenv').config();

const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST, // atau 'localhost'
    user: process.env.DB_USER, // nama user database Anda
    password: process.env.DB_PASSWORD, // password database Anda
    port: process.env.DB_PORT,
    database: process.env.DB_NAME, // nama database Anda
  },
});

module.exports = {knex};
