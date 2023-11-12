/* mendapatkan semua praktikum, membuat praktikum baru, menghapus praktikum,
menambah jadwal praktikum, menghapus jadwal praktikum,
mendapatkan jadwal praktikum,  */

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
  const praktikum_id = req.params.praktikumId;
  const {
    judul_modul,
    tanggal,
    waktu_mulai,
    kuota,
  } = req.body;
  try {
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
  const praktikum_id = req.params.praktikumId;
  const jadwal_id = req.params.jadwalId;
  try {
    const result = await knex('jadwalPraktikum')
        .where(jadwal_id, praktikum_id)
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

// mengedit jadwal praktikum (koor)
const editJadwal = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  const jadwal_id = req.params.jadwalId;
  const {
    judul_modul,
    tanggal,
    waktu_mulai,
    kuota,
  } = req.body;
  try {
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

    const jadwal = await knex('jadwalPraktikum')
        .where({jadwal_id, praktikum_id})
        .first();

    if (!jadwal) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Jadwal tidak ditemukan',
        },
      });
    }

    await knex('jadwalPraktikum')
        .where({jadwal_id, praktikum_id})
        .update({
          judul_modul,
          tanggal,
          waktu_mulai,
          kuota,
        });

    const jadwalUpdated = await knex('jadwalPraktikum')
        .where({jadwal_id, praktikum_id})
        .first();

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: jadwalUpdated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: '500',
      status: 'Internal Server Error',
      errors: {
        message: 'An error occurred while editing data',
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

// menghapus praktikum
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

// mengambil jadwal praktikum (praktikan)
const ambilJadwal = async (req, res) => {
  const {user_id} = req.user_id;
  const {praktikum_id} = req.praktikumId;
  const {jadwal_id, tanggal, waktu} = req.body;

  try {
    // Validasi input
    if (!jadwal_id || !tanggal || !waktu) {
      return res.status(400).json({
        message: 'Semua informasi jadwal diperlukan.',
      });
    }

    // Memeriksa apakah slot masih tersedia
    const kuota = await knex('jadwalPraktikum')
        .where({jadwal_id, praktikum_id})
        .select('kuota')
        .first();

    if (!kuota || kuota.kuota <= 0) {
      return res.status(409).json({
        message: 'Kuota untuk jadwal ini sudah penuh.',
      });
    }

    // Memeriksa apakah praktikan sudah mengambil jadwal ini
    const sudahDiambil = await knex('mhsPilihPraktikum')
        .where({user_id, praktikum_id, jadwal_id})
        .first();

    if (sudahDiambil) {
      return res.status(409).json({
        message: 'Anda sudah mengambil jadwal ini.',
      });
    }

    // Mengambil jadwal
    await knex('mhsPilihPraktikum').insert({
      user_id,
      praktikum_id,
      jadwal_id,
      // Asumsi kolom untuk tanggal dan waktu sudah ada
      tanggal,
      waktu,
    });

    // Mengurangi kuota
    await knex('jadwalPraktikum')
        .where({jadwal_id})
        .decrement('kuota', 1);

    return res.status(200).json({
      message: 'Jadwal berhasil diambil.',
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

// melihat kelompok untuk 1 praktikum
const lihatKelompok = async (req, res) => {
  const {jadwalId} = req.params.jadwalId;
  try {
    const kelompokDetails = await knex('kelompok as k')
        .join('mhsPilihPraktikum as mpp', 'k.kelompok_id', 'mpp.kelompok_id')
        .join('users as u', 'mpp.user_id', 'u.user_id')
        .where('k.jadwal_id', jadwalId)
        .select(
            'k.kelompok_id',
            'k.nama_kelompok',
            'u.nama',
            'u.nrp',
        )
        .orderBy('k.kelompok_id');

    if (!kelompokDetails.length) {
      return res.status(404).json({message: 'Kelompok tidak ditemukan.'});
    }

    return res.status(200).json({kelompok: kelompokDetails});
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

// melihat jadwal praktikum (dashboard koor)
const jadwalPrakKoor = async (req, res) => {
  const {praktikumId} = req.params.praktikumId;
  try {
    const jadwal = await knex('jadwalPraktikum')
        .select('judul_modul', 'tanggal', 'waktu_mulai as sesi')
        .where('praktikum_id', praktikumId);

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: jadwal,
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
  getAllPraktikum, addPraktikum, deletePraktikum, addJadwalPraktikum,
  deleteJadwalPraktikum, getAllJadwal, ambilJadwal, lihatKelompok,
  jadwalPrakKoor, editJadwal,
};
