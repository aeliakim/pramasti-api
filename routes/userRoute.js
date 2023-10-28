const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  login,
  register,
  token,
  logout,
  profile,
  assistantProfile} = require('../controllers/userController');
const {
  authenticateRefreshToken,
  authenticateAccessToken} = require('../middleware/authenticate');

router.post('/signup', register);
router.post('/signin', login);
router.post('/token', authenticateRefreshToken, token);
router.post('/signout', authenticateRefreshToken, logout);
router.get('/profile', authenticateAccessToken, profile);
router.get('/profile-asisten/:userId', assistantProfile);

module.exports = router;
