require('dotenv').config();

const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST, // atau 'localhost'
    user: process.env.DB_USER, // nama user database Anda
    password: process.env.DB_PASSWORD, // password database Anda
    database: process.env.DB_NAME, // nama database Anda
  },
  pool: {min: 0, max: 7}, // Konfigurasi pool jika diperlukan
});

module.exports = {knex};
