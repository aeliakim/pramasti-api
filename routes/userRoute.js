const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {login, register} = require('../controllers/userController');

router.post('/signup', register);
router.post('/signin', login);

module.exports = router;
