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
  ambilJadwal, editJadwal, lihatKelompok, jadwalPrakKoor,
} = require('../controllers/praktikumController');
const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate');

// melihat daftar praktikum yang tersedia (all role)
router.get('/', authenticateAccessToken, getAllPraktikum);

// menambah praktikum baru (admin)
router.post('/add',
    authenticateAccessToken,
    authorize(['admin']), addPraktikum);

// menghapus praktikum (admin)
router.delete('/:praktikum_id',
    authenticateAccessToken, authorize(['admin']),
    deletePraktikum);

// buat jadwal praktikum
router.post('/:praktikumId/jadwal', authenticateAccessToken,
    authorize(['admin', 'koordinator', 'dosen']), addJadwalPraktikum);

// hapus jadwal praktikum
router.delete('/:praktikumId/jadwal/:jadwalId',
    authenticateAccessToken,
    authorize(['admin', 'koordinator', 'dosen']), deleteJadwalPraktikum);

// melihat jadwal praktikum (praktikan)
router.get('/jadwal-praktikum', authenticateAccessToken,
    authorize(['praktikan']), getAllJadwal);

// mengambil jadwal praktikum (praktikan)
router.post('/:praktikumId', authenticateAccessToken,
    authorize(['praktikan']), ambilJadwal);

// melihat kelompok untuk 1 praktikum
router.get('/jadwal-praktikum/:jadwalId/kelompok', authenticateAccessToken,
    authorize(['praktikan', 'asisten', 'koordinator', 'dosen']), lihatKelompok);

// mengedit jadwal praktikum
router.put('/:praktikumId/jadwal/:jadwalId',
    authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), editJadwal);

// melihat jadwal praktikum (dashboard koor)
router.get('/:praktikumId/jadwal', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), jadwalPrakKoor);

module.exports = router;
