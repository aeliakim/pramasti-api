/* menambah asisten, menghapus asisten, menambah koor, menghapus koor,
menambah dosen, menghapus dosen, menampilkan list roles*/

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {
  getRoleLists, addAsisten, deleteAsisten, addKoor, deleteKoor,
  addDosen, deleteDosen,
} = require('../controllers/roleController');
const {
  authorize,
  authenticateAccessToken} = require('../middleware/authenticate');

// menampilkan manajemen role
router.get('/:praktikumId', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), getRoleLists);

// menambah asisten
router.post('/:praktikumId/asisten', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), addAsisten);

// menghapus asisten
router.delete('/:praktikumId/:nrp', authenticateAccessToken,
    authorize(['koordinator', 'dosen', 'admin']), deleteAsisten);

// menambah koordinator
router.post('/:praktikumId/koor', authenticateAccessToken,
    authorize(['dosen', 'admin']), addKoor);

// menghapus koordinator
router.delete('/:praktikumId/:nrp', authenticateAccessToken,
    authorize(['dosen', 'admin']), deleteKoor);

// menambah dosen
router.post('/:praktikumId/dosen', authenticateAccessToken,
    authorize(['admin']), addDosen);

// menghapus dosen
router.delete('/:praktikumId/:nrp', authenticateAccessToken,
    authorize(['admin']), deleteDosen);

module.exports = router;
