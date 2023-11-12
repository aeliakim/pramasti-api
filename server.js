const express = require('express');
const asistensiRoute = require('./routes/asistensiRoute.js');
const nilaiRoute = require('./routes/nilaiRoute.js');
const pengumumanRoute = require('./routes/pengumumanRoute.js');
const praktikumRoute = require('./routes/praktikumRoute.js');
const roleRoute = require('./routes/roleRoute.js');
const userRoute = require('./routes/userRoute.js');
// const {knex} = require('./configs/data-source.js');
const web = express();
const port = 8080;

web.use(express.json());
web.use(express.urlencoded({extended: true}));

web.get('/', (req, res) => {
  res.status(200).send({
    code: '200',
    status: 'OK',
    message: 'Welcome to the Pramasti API'});
});

web.use('/asistensi', asistensiRoute);
web.use('/nilai', nilaiRoute);
web.use('/pengumuman', pengumumanRoute);
web.use('/praktikum', praktikumRoute);
web.use('/role', roleRoute);
web.use('/user', userRoute);

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
