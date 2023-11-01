const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getAllPraktikum, addPraktikum, deletePraktikum,
  addJadwalPraktikum, deleteJadwalPraktikum, getAllJadwal,
} = require('../controllers/praktikumController');
/* const {
  authenticateRefreshToken,
  authenticateAccessToken} = require('../middleware/authenticate');*/

router.get('/praktikum', getAllPraktikum);
router.post('/praktikum/new-praktikum', addPraktikum);
router.delete('/praktikum/:praktikum_id', deletePraktikum);
router.post('/jadwal-praktikum/new-jadwal', addJadwalPraktikum);
router.delete('/jadwal-praktikum/:jadwal_id', deleteJadwalPraktikum);
router.get('/jadwal-praktikum', getAllJadwal);

module.exports = router;
