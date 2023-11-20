/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// melihat daftar praktikum yang tersedia
const getAllPraktikum = async (req, res) => {
  try {
    const role = req.user.role;
    let praktikums;

    if (role == 'praktikan') {
      praktikums = await knex('praktikum')
          .leftJoin('nilai', 'praktikum.praktikum_id', 'nilai.praktikum_id')
          .select('praktikum.praktikum_name',
              'praktikum.deskripsi',
              'praktikum.logo_praktikum',
              'nilai.nilai as nilai');
    } else {
      praktikums = await knex('praktikum')
          .select('praktikum.praktikum_name',
              'praktikum.deskripsi',
              'praktikum.logo_praktikum');
    }

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

// melihat jadwal praktikum (praktikan)
const getAllJadwal = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const jadwal = await knex('jadwalPraktikum')
        .leftJoin('mhsPilihPraktikum', 'jadwalPraktikum.jadwal_id',
            'mhsPilihPraktikum.jadwal_id')
        .leftJoin('kelompok', 'jadwalPraktikum.jadwal_id', 'kelompok.jadwal_id')
        .leftJoin('users', 'kelompok.kelompok_id',
            'mhsPilihPraktikum.kelompok_id')
        .leftJoin('praktikum', 'jadwalPraktikum.praktikum_id',
            'praktikum.praktikum_id')
        .where('mhsPilihPraktikum.user_id', userId)
        .select(
            'praktikum.praktikum_name',
            'jadwalPraktikum.judul_modul',
            'jadwalPraktikum.tanggal',
            'jadwalPraktikum.waktu_mulai',
            'users.nama as nama_asisten',
            'kelompok.nama_kelompok',
        );

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
        message: 'An error occurred while fetching data',
      },
    });
  }
};

// buat jadwal praktikum
const addJadwalPraktikum = async (req, res) => {
  const praktikum_id = parseInt(req.params.praktikumId, 10);
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
        .where({'jadwal_id': jadwal_id, 'praktikum_id': praktikum_id})
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
  const praktikum_id = req.params.praktikumId;
  try {
    const result = await knex('praktikum')
        .where('praktikum_id', praktikum_id)
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

// mengedit praktikum
const editPraktikum = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  const {praktikum_name, deskripsi} = req.body;
  try {
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
    const praktikum = await knex('praktikum')
        .where({praktikum_id})
        .first();

    if (!praktikum) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Praktikum tidak ditemukan',
        },
      });
    }

    await knex('praktikum')
        .where({praktikum_id})
        .update({praktikum_name, deskripsi});

    const praktikumUpdated = await knex('praktikum')
        .where({praktikum_id})
        .first();

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: praktikumUpdated,
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

// mengambil praktikum (praktikan)
const ambilJadwal = async (req, res) => {
  const user_id = req.user.user_id;
  const praktikum_id = req.params.praktikumId;
  const {tanggal, waktu_mulai} = req.body;

  try {
    // Validasi input
    if (!tanggal || !waktu_mulai) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        message: 'Semua informasi jadwal diperlukan.',
      });
    }

    const jadwalTersedia = await knex('jadwalPraktikum')
        .where({praktikum_id})
        .andWhere('tanggal', tanggal)
        .andWhere('waktu_mulai', waktu_mulai)
        .andWhere('kuota', '>', 0)
        .select('jadwal_id', 'kuota')
        .first();

    if (!jadwalTersedia) {
      return res.status(409).json({
        code: '409',
        status: 'Conflict',
        message: 'Tidak ada jadwal tersedia yang sesuai.',
      });
    }

    const {jadwal_id, kuota} = jadwalTersedia;

    // Memeriksa apakah praktikan sudah mengambil jadwal ini
    const sudahDiambil = await knex('mhsPilihPraktikum')
        .where({user_id, jadwal_id})
        .first();

    if (sudahDiambil) {
      return res.status(409).json({
        code: '409',
        status: 'Conflict',
        message: 'Anda sudah mengambil jadwal ini.',
      });
    }

    // Mencari kelompok dengan kapasitas yang belum penuh
    let kelompok = await knex('kelompok')
        .leftJoin('mhsPilihPraktikum', 'kelompok.kelompok_id',
            'mhsPilihPraktikum.kelompok_id')
        .select('kelompok.*')
        .count('mhsPilihPraktikum.user_id as jumlah_anggota')
        .where('kelompok.jadwal_id', jadwal_id)
        .groupBy('kelompok.kelompok_id')
        .having(knex.raw('jumlah_anggota < kelompok.kapasitas'))
        .first();

    // Jika tidak ada kelompok yang tersedia, buat kelompok baru
    if (!kelompok) {
      const insertedIds = await knex('kelompok').insert({
        kapasitas: 5,
        jadwal_id,
      });
      const newKelompokId = insertedIds[0];
      kelompok = {kelompok_id: newKelompokId, kapasitas: 5};
    }

    // Mengambil jadwal
    await knex('mhsPilihPraktikum').insert({
      user_id,
      praktikum_id,
      jadwal_id,
      kelompok_id: kelompok.kelompok_id,
    });

    // Mengurangi kuota
    await knex('jadwalPraktikum')
        .where({jadwal_id})
        .decrement('kuota', 1);

    return res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Jadwal berhasil diambil.',
      data: {
        jadwal_id,
        praktikum_id,
        tanggal,
        waktu_mulai,
        kuota: kuota - 1, // Menampilkan kuota yang telah diperbarui
        kelompok_id: kelompok.kelompok_id,
      },
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

// melihat jadwal yang tersedia (praktikan)
const getJadwalPraktikum = async (req, res) => {
  const praktikumId = req.params.praktikumId;
  try {
    const jadwals = await knex('jadwalPraktikum')
        .select('judul_modul', 'tanggal', 'waktu_mulai', 'kuota')
        .where({
          praktikum_id: praktikumId,
        });

    return res.status(200).json({
      status: 'success',
      data: jadwals,
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

// melihat kelompok untuk 1 praktikum
const lihatKelompok = async (req, res) => {
  const jadwalId = req.params.jadwalId;
  try {
    const kelompokDetails = await knex('kelompok as k')
        .join('mhsPilihPraktikum as mpp', 'k.kelompok_id', 'mpp.kelompok_id')
        .join('users as u', 'mpp.user_id', 'u.user_id')
        .where('k.jadwal_id', jadwalId)
        .select(
            'k.kelompok_id',
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
  const {praktikumId} = req.params;
  try {
    const jadwal = await knex('jadwalPraktikum')
        .leftJoin('praktikum', 'jadwalPraktikum.praktikum_id',
            'praktikum.praktikum_id')
        .where('jadwalPraktikum.praktikum_id', praktikumId)
        .select('jadwalPraktikum.judul_modul',
            'jadwalPraktikum.tanggal', 'jadwalPraktikum.waktu_mulai as sesi');

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
  jadwalPrakKoor, editJadwal, getJadwalPraktikum, editPraktikum,
};
