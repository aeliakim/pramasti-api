const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.status(200).send({
    code: '200',
    status: 'OK',
    message: 'Welcome to the Pramasti API'});
});

app.use(function(req, res, next) {
  res.status(404).send({
    code: '404',
    status: 'Not Found',
    errors: {
      message: 'The page or resource you\'re looking for could not be found.',
    },
  });
});

app.listen(port, () => {
  console.log(`Pramasti web listening at http://localhost:${port}`);
});
