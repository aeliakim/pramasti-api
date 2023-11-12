// melihat jadwal asistensi, memilih jadwal asistensi, hapus jadwal,

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getJadwalAsistensi,
  addAsistensi,
  deleteAsistensi,
} = require('../controllers/asistensiController');
const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate');

// melihat jadwal asistensi
router.get('/:praktikumId/asistensi', authenticateAccessToken,
    authorize(['asisten', 'koordinator', 'dosen', 'admin']),
    getJadwalAsistensi);

// memilih jadwal asistensi
router.post('/:praktikumId/asistensi', authenticateAccessToken,
    authorize(['asisten', 'koordinator', 'dosen', 'admin']), addAsistensi);

// menghapus jadwal asistensi
router.delete('/:praktikumId/asistensi/:jadwalId',
    authenticateAccessToken,
    authorize(['asisten', 'koordinator', 'dosen', 'admin']), deleteAsistensi);

module.exports = router;

