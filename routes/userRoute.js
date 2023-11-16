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
  authenticateAccessToken, authorize} = require('../middleware/authenticate');

// daftar akun (register)
router.post('/signup', register);

// login
router.post('/signin', login);

// khusus token
router.post('/token', authenticateRefreshToken, token);

// signout
router.post('/profile/signout', authenticateRefreshToken, logout);

// melihat profile sendiri
router.get('/profile', authenticateAccessToken, profile);

// melihat profil asisten
router.get('/profile-asisten/:userId', authenticateAccessToken,
    authorize(['praktikan']), assistantProfile);

module.exports = router;
