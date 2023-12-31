// melihat jadwal asistensi, memilih jadwal asistensi, hapus jadwal,

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getJadwalAsistensi,
  addAsistensi,
  deleteAsistensi,
  getAllAsistensi,
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
    authorize(['asisten', 'koordinator']), addAsistensi);

// menghapus jadwal asistensi
router.delete('/:praktikumId/asistensi/:jadwalId/:userId',
    authenticateAccessToken,
    authorize(['asisten', 'koordinator', 'dosen', 'admin']), deleteAsistensi);

// melihat seluruh jadwal asistensi yang diambil
router.get('/jadwal-asistensi', authenticateAccessToken,
    authorize(['asisten']), getAllAsistensi);

module.exports = router;

