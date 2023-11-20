/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// melihat jadwal asistensi
const getJadwalAsistensi = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  try {
    const asistensi = await knex('jadwalPraktikum as jp')
        .join('praktikum as p', 'jp.praktikum_id', 'p.praktikum_id')
        .leftJoin('asistenJadwal as aj', 'jp.jadwal_id', 'aj.jadwal_id')
        .leftJoin('asisten as a', 'aj.asisten_id', 'a.asisten_id')
        .leftJoin('users as u', 'a.user_id', 'u.user_id')
        .select(
            'p.praktikum_name',
            'jp.judul_modul',
            'jp.tanggal',
            'jp.waktu_mulai as sesi',
            'u.nama as nama_asisten',
        )
        .where('p.praktikum_id', praktikum_id);

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

// memilih jadwal asistensi
const addAsistensi = async (req, res) => {
  const {jadwalId} = req.body;
  const asistenId = req.user.user_id;
  const praktikum_id = req.params.praktikumId;

  try {
    const jadwalExists = await knex('jadwalPraktikum')
        .where({jadwal_id: jadwalId, praktikum_id: praktikum_id})
        .first();

    if (!jadwalExists) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        message: 'Jadwal atau praktikum tidak ditemukan.',
      });
    }

    // Pastikan jadwal belum diambil oleh asisten lain
    const isTaken = await knex('asistenJadwal')
        .where({jadwal_id: jadwalId, praktikum_id: praktikum_id})
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

// hapus jadwal asistensi
const deleteAsistensi = async (req, res) => {
  const {jadwalId} = req.body;
  const asistenId = req.user.user_id;
  const praktikum_id = req.params.praktikumId;

  try {
    // Lakukan pemeriksaan apakah entri ada di database
    const entry = await knex('asistenJadwal')
        .where({
          'asisten_id': asistenId,
          'jadwal_id': jadwalId,
          'praktikum_id': praktikum_id,
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
          'praktikum_id': praktikum_id,
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
        message: 'An error occurred while deleting data',
      },
    });
  }
};

module.exports = {
  getJadwalAsistensi,
  addAsistensi,
  deleteAsistensi,
};
