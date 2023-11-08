/* mendapatkan semua praktikum, membuat praktikum baru, menghapus praktikum,
menambah jadwal praktikum, menghapus jadwal praktikum,
mendapatkan jadwal praktikum, mengedit nilai,
menambah nilai,
melihat daftar peserta berdasarkan tahun ajaran, */
/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// melihat daftar praktikum yang tersedia
const getAllPraktikum = async (req, res) => {
  try {
    const praktikums = await knex('praktikum')
        .join('nilai', 'praktikum.praktikum_id', 'nilai.praktikum_id')
        .select('praktikum.praktikum_name',
            'praktikum.deskripsi',
            'praktikum.logo_praktikum',
            'nilai.nilai as nilai');

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: praktikums,
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

// melihat jadwal praktikum
const getAllJadwal = async (req, res) => {
  try {
    const jadwal = await knex('jadwalPraktikum')
        .join('praktikum', 'asisten', 'jadwalPraktikum.praktikum_id',
            'praktikum.praktikum_id',
            'asisten.praktikum_id')
        .join('asisten', 'jadwalPraktikum.praktikum_id', 'asisten.praktikum_id')
        .join('users', 'asisten.user_id', 'users.user_id')
        .join('kelompok', 'jadwalPraktikum.jadwal_id', 'kelompok.jadwal_id')
        .select('praktikum.praktikum_name as nama_praktikum',
            'jadwalPraktikum.judul_modul',
            'jadwalPraktikum.tanggal',
            'jadwalPraktikum.waktu_mulai as sesi',
            'users.nama as nama_asisten',
            'kelompok.nama_kelompok',
        );

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: jadwal.map((item) => ({
        ...item,
        tanggal: item.tanggal.toDateString(),
        waktu_mulai: item.waktu_mulai.toTimeString(),
      })),
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

// buat jadwal praktikum
const addJadwalPraktikum = async (req, res) => {
  try {
    const {
      praktikum_id,
      judul_modul,
      tanggal,
      waktu_mulai,
      kuota,
    } = req.body;
    // validasi input
    if (!judul_modul || !tanggal || !waktu_mulai || !kuota) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: 'Semua field harus diisi!',
        },
      });
    }

    // Menyimpan ke database
    const [jadwalId] = await knex('jadwalPraktikum').insert({
      praktikum_id,
      judul_modul,
      tanggal,
      waktu_mulai,
      kuota,
    });

    const jadwalPraktikum = {
      jadwal_id: jadwalId,
      praktikum_id,
      judul_modul,
      tanggal,
      waktu_mulai,
      kuota,
    };

    return res.status(201).json({
      code: '201',
      status: 'Success',
      data: jadwalPraktikum,
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
// hapus jadwal praktikum
const deleteJadwalPraktikum = async (req, res) => {
  try {
    const result = await knex('jadwalPraktikum')
        .where('jadwal_id', req.params.jadwalId)
        .del();
    if (result == 1) {
      return res.status(200).json({
        code: '200',
        status: 'OK',
        data: {
          message: 'Jadwal removed',
        },
      });
    } else {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Jadwal does not exist in the database',
        },
      });
    }
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

// menambah praktikum baru
const addPraktikum = async (req, res) => {
  try {
    const {praktikum_name,
      deskripsi} = req.body;

    // validasi input
    if (!praktikum_name || !deskripsi) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: 'Semua field harus diisi!',
        },
      });
    }
    // Menyimpan ke database
    const [praktikumId] = await knex('praktikum').insert({
      praktikum_name,
      deskripsi,
    });

    const praktikum = {praktikum_id: praktikumId, praktikum_name,
      deskripsi};

    return res.status(201).json({
      code: '201',
      status: 'Success',
      data: praktikum,
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

// menghapus praktikum (admin)
const deletePraktikum = async (req, res) => {
  try {
    const result = await knex('praktikum')
        .where('praktikum_id', req.params.praktikumId)
        .del();
    if (result == 1) {
      return res.status(200).json({
        code: '200',
        status: 'OK',
        data: {
          message: 'Praktikum removed',
        },
      });
    } else {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Praktikum does not exist in the database',
        },
      });
    }
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
  getAllPraktikum, addPraktikum, deletePraktikum, addJadwalPraktikum,
  deleteJadwalPraktikum, getAllJadwal,
};
