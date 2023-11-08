/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

const getJadwalAsistensi = async (req, res) => {
  try {
    const asistensi = await knex('asistenJadwal')
        .join('asisten', 'asistenJadwal.asisten_id', 'asisten.asisten_id')
        .join('users', 'asisten.user_id', 'users.user_id')
        .join('jadwalPraktikum', 'asistenJadwal.jadwal_id',
            'jadwalPraktikum.jadwal_id')
        .join('praktikum', 'jadwalPraktikum.praktikum_id',
            'praktikum.praktikum_id')
        .join('kelompok', 'jadwalPraktikum.jadwal_id', 'kelompok.jadwal_id')
        .select('praktikum.praktikum_name',
            'jadwalPraktikum.judul_modul',
            'jadwalPraktikum.waktu_mulai as sesi',
            'jadwalPraktikum.tanggal',
            'users.nama as nama_asisten',
            'kelompok.nama_kelompok');

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: asistensi,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: '500',
      status: 'Internal Server Error',
      errors: {
        message: 'An error occurred while fetching data',
      },
    });
  }
};

const addAsistensi = async (req, res) => {
  // ID jadwal dari request body atau query params
  const {jadwalId} = req.body;
  // ID asisten dari sesi pengguna atau token JWT
  const asistenId = req.user.user_id;

  try {
    // Pastikan jadwal belum diambil oleh asisten lain
    const isTaken = await knex('asistenJadwal')
        .where({jadwal_id: jadwalId})
        .first();

    if (isTaken) {
      return res.status(409).json({
        code: '409',
        status: 'Conflict',
        message: 'Jadwal ini sudah diambil oleh asisten lain.',
      });
    }

    // Tambahkan asisten ke jadwal tersebut
    await knex('asistenJadwal').insert({
      asisten_id: asistenId,
      jadwal_id: jadwalId,
    });

    return res.status(201).json({
      code: '201',
      status: 'Created',
      message: 'Asisten berhasil mengambil jadwal asistensi.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: '500',
      status: 'Internal Server Error',
      errors: {
        message: 'An error occurred while adding data',
      },
    });
  }
};

const deleteAsistensi = async (req, res) => {
  // ID jadwal dari request body atau query params
  const {jadwalId} = req.body;
  // ID asisten dari sesi pengguna atau token JWT
  const asistenId = req.user.user_id;
  try {
    // Lakukan pemeriksaan apakah entri ada di database
    const entry = await knex('asistenJadwal')
        .where({
          'asisten_id': asistenId,
          'jadwal_id': jadwalId,
        })
        .first();

    if (!entry) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        message: 'Jadwal asistensi tidak ditemukan atau tidak sesuai.',
      });
    }

    // Hapus entri dari database
    await knex('asistenJadwal')
        .where({
          'asisten_id': asistenId,
          'jadwal_id': jadwalId,
        })
        .del();

    return res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Jadwal asistensi berhasil dibatalkan.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: '500',
      status: 'Internal Server Error',
      errors: {
        message: 'An error occurred while adding data',
      },
    });
  }
};

module.exports = {
  getJadwalAsistensi,
  addAsistensi,
  deleteAsistensi,
};
