/* menampilkan daftar peserta, menambahkan nilai, mengedit nilai */

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getPeserta, addOrUpdateNilai,
} = require('../controllers/nilaiController');
const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate');

// menampilkan daftar peserta
router.get('/:praktikumId/peserta', authenticateAccessToken,
    authorize(['asisten', 'koordinator', 'dosen', 'admin']), getPeserta);

// menambahkan nilai
router.put('/:praktikumId/peserta/:userId', authenticateAccessToken,
    authorize(['asisten', 'admin']), addOrUpdateNilai);

module.exports = router;
