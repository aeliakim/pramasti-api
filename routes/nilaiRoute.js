/* menampilkan daftar peserta, menambahkan nilai, mengedit nilai */

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getPeserta, addNilai, editNilai,
} = require('../controllers/nilaiController');
const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate');

// menampilkan daftar peserta
router.get('/:praktikumId/peserta', authenticateAccessToken,
    authorize(['asisten', 'koordinator', 'dosen', 'admin']), getPeserta);

// menambahkan nilai
router.post('/:praktikumId/peserta', authenticateAccessToken,
    authorize(['asisten', 'koordinator', 'dosen', 'admin']), addNilai);

// mengedit nilai
router.put('/:praktikumId/peserta/:nilai_id', authenticateAccessToken,
    authorize(['asisten', 'koordinator', 'dosen', 'admin']), editNilai);

module.exports = router;
