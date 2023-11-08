/* mendapatkan semua praktikum, membuat praktikum baru, menghapus praktikum,
menambah jadwal praktikum, menghapus jadwal praktikum,
mendapatkan jadwal praktikum, mengedit nilai,
menambah nilai,
melihat daftar peserta berdasarkan tahun ajaran, */

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getAllPraktikum, addPraktikum, deletePraktikum,
  addJadwalPraktikum, deleteJadwalPraktikum, getAllJadwal,
} = require('../controllers/praktikumController');
const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate');

router.get('/praktikum', getAllPraktikum);
router.post('/praktikum/new-praktikum',
    authenticateAccessToken,
    authorize(['admin', 'koordinator', 'dosen']), addPraktikum);
router.delete('/praktikum/:praktikum_id',
    authenticateAccessToken, authorize(['admin', 'koordinator', 'dosen']),
    deletePraktikum);
router.post('/jadwal-praktikum/new-jadwal', authenticateAccessToken,
    authorize(['admin', 'koordinator', 'dosen']), addJadwalPraktikum);
router.delete('/jadwal-praktikum/:jadwal_id', authenticateAccessToken,
    authorize(['admin', 'koordinator', 'dosen']), deleteJadwalPraktikum);
router.get('/jadwal-praktikum', getAllJadwal);

module.exports = router;
