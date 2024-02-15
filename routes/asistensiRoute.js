// melihat jadwal asistensi, memilih jadwal asistensi, hapus jadwal,

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getJadwalAsistensi,
  addAsistensi,
  deleteAsistensi,
  getAllAsistensi,
  lihatKelompokAsis,
  lihatKelompokPrak,
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

// melihat seluruh kelompok (asisten)
router.get('/jadwal-asistensi/kelompok',
    authenticateAccessToken, authorize(['asisten']), lihatKelompokAsis);

// melihat kelompok berdasarkan praktikum (koor, dosen)
router.get('/:praktikumId/asistensi/kelompok', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), lihatKelompokPrak);

module.exports = router;

