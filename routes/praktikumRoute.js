const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getAllPraktikum, addPraktikum, deletePraktikum,
  addJadwalPraktikum, deleteJadwalPraktikum, getAllJadwal,
  ambilJadwal, editJadwal, lihatKelompok, jadwalPrakKoor,
  getJadwalPraktikum, editPraktikum, addModul, getModul,
  deleteModul, getJadwalPicked,
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
router.delete('/:praktikumId',
    authenticateAccessToken, authorize(['admin']),
    deletePraktikum);

// mengedit praktikum (admin)
router.put('/:praktikumId', authenticateAccessToken,
    authorize(['admin']), editPraktikum);

// buat jadwal praktikum
router.post('/:praktikumId/modul/jadwal', authenticateAccessToken,
    authorize(['admin', 'koordinator', 'dosen']), addJadwalPraktikum);

// hapus jadwal praktikum
router.delete('/:praktikumId/modul/jadwal/:jadwalId',
    authenticateAccessToken,
    authorize(['admin', 'koordinator', 'dosen']), deleteJadwalPraktikum);

// melihat jadwal praktikum (praktikan)
router.get('/jadwal-praktikum', authenticateAccessToken,
    authorize(['praktikan']), getAllJadwal);

// melihat jadwal yang tersedia (praktikan)
router.get('/:praktikumId/ambil', authenticateAccessToken,
    authorize(['praktikan']), getJadwalPraktikum);

// mengambil praktikum (praktikan)
router.post('/:praktikumId/ambil', authenticateAccessToken,
    authorize(['praktikan']), ambilJadwal);

// melihat kelompok praktikan
router.get('/jadwal-praktikum/kelompok', authenticateAccessToken,
    authorize(['praktikan']), lihatKelompok);

// mengedit jadwal praktikum
router.put('/:praktikumId/modul/jadwal/:jadwalId',
    authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), editJadwal);

// melihat jadwal praktikum (dashboard koor)
router.get('/:praktikumId/modul/jadwal', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), jadwalPrakKoor);

// melihat daftar modul
router.get('/:praktikumId/modul', authenticateAccessToken,
    authorize(['dosen', 'admin', 'koordinator']), getModul);

// menambah modul
router.post('/:praktikumId/modul', authenticateAccessToken,
    authorize(['dosen', 'admin']), addModul);

// menghapus modul
router.delete('/:praktikumId/modul/:id_modul', authenticateAccessToken,
    authorize(['dosen', 'admin']), deleteModul);

/* melihat jadwal untuk modul yang sudah diambil
maupun belum untuk satu praktikum di page ambil jadwal praktikan*/
router.get('/:praktikumId/ambil/jadwal', authenticateAccessToken,
    authorize(['praktikan']), getJadwalPicked);

module.exports = router;
