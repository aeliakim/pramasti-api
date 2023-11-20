// melihat pengumuman, input pengumuman,
// mengedit pengumuman, menghapus pengumuman

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getAllPengumuman,
  addPengumuman,
  editPengumuman,
  deletePengumuman,
} = require('../controllers/pengumumanController');
const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate');

router.get('/', getAllPengumuman);
router.post('/add', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), addPengumuman);
router.put('/:pengumumanId', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), editPengumuman);
router.delete('/:pengumumanId', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), deletePengumuman);

module.exports = router;
