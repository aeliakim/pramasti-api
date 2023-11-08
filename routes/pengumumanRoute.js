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
} = require('../controllers/praktikumController');
/* const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate'); */

router.get('/pengumuman', getAllPengumuman);
router.post('/pengumuman/add', addPengumuman);
router.put('/pengumuman/edit', editPengumuman);
router.delete('/pengumuman/delete/:pengumumanId', deletePengumuman);

module.exports = router;
