// melihat jadwal asistensi, memilih jadwal asistensi, hapus jadwal,

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getJadwalAsistensi,
  addAsistensi,
  deleteAsistensi,
} = require('../controllers/asistensiController');
/* const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate'); */

router.get('/asistensi', getJadwalAsistensi);
router.post('/asistensi/take', addAsistensi);
router.delete('/asistensi/cancel/:jadwalId', deleteAsistensi);

module.exports = router;

