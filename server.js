const express = require('express');
const cors = require('cors');
require('dotenv').config();
const asistensiRoute = require('./routes/asistensiRoute.js');
const nilaiRoute = require('./routes/nilaiRoute.js');
const pengumumanRoute = require('./routes/pengumumanRoute.js');
const praktikumRoute = require('./routes/praktikumRoute.js');
const roleRoute = require('./routes/roleRoute.js');
const userRoute = require('./routes/userRoute.js');
const {knex} = require('./configs/data-source.js');

// Test the connection
knex.raw('SELECT 1+1 AS result')
    .then((results) => {
      console.log('Connection to database successful.');
    })
    .catch((error) => {
      console.error('Error connecting to the database:', error);
    });

const web = express();
const port = process.env.PORT;

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:3000', 'https://frontend-dot-pramasti-api.et.r.appspot.com'],
  optionsSuccessStatus: 200,
};

// Enable CORS with the above options
web.use(cors(corsOptions));

// Enable preflight requests for all routes
web.options('*', cors(corsOptions));

// eslint-disable-next-line new-cap
const v1Router = express.Router();

web.use(express.json());
web.use(express.urlencoded({extended: true}));

web.get('/', (req, res) => {
  res.status(200).send({
    code: '200',
    status: 'OK',
    message: 'Welcome to the Pramasti API'});
});

v1Router.use('/asistensi', asistensiRoute);
v1Router.use('/nilai', nilaiRoute);
v1Router.use('/pengumuman', pengumumanRoute);
v1Router.use('/praktikum', praktikumRoute);
v1Router.use('/role', roleRoute);
v1Router.use('/user', userRoute);

web.use('/v1', v1Router);

web.use(function(req, res, next) {
  res.status(404).send({
    code: '404',
    status: 'Not Found',
    errors: {
      message: 'The page or resource you\'re looking for could not be found.',
    },
  });
});

web.listen(port, () => {
  console.log(`Pramasti web listening at http://localhost:${port}`);
});
