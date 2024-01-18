/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// melihat jadwal asistensi
const getJadwalAsistensi = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  try {
    const asistensi = await knex('jadwalPraktikum as jp')
        .join('praktikum as p', 'jp.praktikum_id', 'p.praktikum_id')
        .leftJoin('asistenJadwal as aj', 'jp.jadwal_id', 'aj.jadwal_id')
        .leftJoin('users as u', 'aj.user_id', 'u.user_id')
        .leftJoin('kelompok as k', 'jp.jadwal_id', 'k.jadwal_id')
        .leftJoin('modul as m', 'jp.id_modul', 'm.id_modul')
        .select(
            'p.praktikum_id',
            'jp.jadwal_id',
            'p.praktikum_name',
            'm.judul_modul',
            'jp.start_tgl',
            'jp.start_wkt as sesi',
            'u.nama as nama_asisten',
            'k.kelompok_id',
            'k.nama_kelompok',
        )
        .where('p.praktikum_id', praktikum_id)
        .orderBy(['jp.start_tgl', 'jp.start_wkt']);

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
      user_id: asistenId,
      jadwal_id: jadwalId,
      praktikum_id: praktikum_id,
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
  const jadwalId = req.params.jadwalId;
  const asistenId = req.params.userId;
  const praktikumId = req.params.praktikumId;
  const userId = req.user.user_id; // id pengguna yang saat ini login
  const userRoles = req.user.roles; // peran pengguna yang saat ini login

  try {
    const hasPermission = userRoles.includes('admin') ||
    userRoles.includes('dosen') ||
    (userRoles.includes('koordinator') && asistenId !== userId) ||
    (userRoles.includes('asisten') && asistenId == userId);

    if (!hasPermission) {
      return res.status(403).json({
        code: '403',
        status: 'Forbidden',
        message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
      });
    }

    // Lakukan pemeriksaan apakah entri ada di database
    const entry = await knex('asistenJadwal')
        .where({
          'user_id': asistenId,
          'jadwal_id': jadwalId,
          'praktikum_id': praktikumId,
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
          'user_id': asistenId,
          'jadwal_id': jadwalId,
          'praktikum_id': praktikumId,
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

const getAllAsistensi = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const jadwalAsistensi = await knex('asistenJadwal')
        .leftJoin('jadwalPraktikum',
            'asistenJadwal.jadwal_id', 'jadwalPraktikum.jadwal_id')
        .leftJoin('praktikum',
            'jadwalPraktikum.praktikum_id', 'praktikum.praktikum_id')
        .leftJoin('modul', 'jadwalPraktikum.id_modul', 'modul.id_modul')
        .leftJoin('kelompok', 'jadwalPraktikum.jadwal_id', 'kelompok.jadwal_id')
        .where('asistenJadwal.user_id', userId)
        .select(
            'jadwalPraktikum.jadwal_id',
            'praktikum.praktikum_id',
            'praktikum.praktikum_name',
            'modul.judul_modul',
            'jadwalPraktikum.start_tgl',
            'jadwalPraktikum.start_wkt',
            'kelompok.kelompok_id',
            'kelompok.nama_kelompok',
        );

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: jadwalAsistensi,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: '500',
      status: 'Internal Server Error',
      errors: {
        message: 'An error occurred while fetching assistance schedules',
      },
    });
  }
};

module.exports = {
  getJadwalAsistensi,
  addAsistensi,
  deleteAsistensi,
  getAllAsistensi,
};
