/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// melihat daftar praktikum yang tersedia
const getAllPraktikum = async (req, res) => {
  try {
    const userId = req.user.user_id;
    // Role yang dipilih user dari dropdown atau role default dari token
    const selectedRole = req.query.role || req.user.roles[0];
    let praktikums;

    if (selectedRole === 'praktikan') {
      // Praktikan melihat semua praktikum dengan nilai akhir
      praktikums = await knex('praktikum');
      praktikums = await knex('praktikum')
          .leftJoin('nilai_akhir', function() {
            this.on('praktikum.praktikum_id', '=', 'nilai_akhir.praktikum_id')
                .andOn('nilai_akhir.user_id', '=', knex.raw('?', [userId]));
          })
          .select(
              'praktikum.praktikum_id',
              'praktikum.praktikum_name',
              'praktikum.deskripsi',
              'praktikum.logo_praktikum',
              'nilai_akhir.nilai_akhir as nilai',
          );
    } else if (selectedRole === 'admin') {
      // Admin melihat semua praktikum tanpa nilai akhir
      praktikums = await knex('praktikum')
          .select(
              'praktikum.praktikum_id',
              'praktikum.praktikum_name',
              'praktikum.deskripsi',
              'praktikum.logo_praktikum',
          );
    } else {
      praktikums = await knex('praktikum as p')
          .join('roles as r', 'p.praktikum_id', 'r.praktikum_id')
          .where('r.user_id', req.user.user_id)
          .andWhere('r.role_name', selectedRole)
          .select(
              'p.praktikum_id',
              'p.praktikum_name',
              'p.deskripsi',
              'p.logo_praktikum',
          );
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
        .leftJoin('asistenJadwal', 'jadwalPraktikum.jadwal_id',
            'asistenJadwal.jadwal_id')
        .leftJoin('users', 'asistenJadwal.user_id', 'users.user_id')
        .leftJoin('praktikum', 'jadwalPraktikum.praktikum_id',
            'praktikum.praktikum_id')
        .leftJoin('modul', 'jadwalPraktikum.id_modul', 'modul.id_modul')
        .where('mhsPilihPraktikum.user_id', userId)
        .select(
            'jadwalPraktikum.jadwal_id',
            'praktikum.praktikum_id',
            'praktikum.praktikum_name',
            'modul.judul_modul',
            'jadwalPraktikum.start_tgl',
            'jadwalPraktikum.start_wkt',
            'users.user_id as asisten_user_id',
            'users.nama as nama_asisten',
            'kelompok.kelompok_id',
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

// melihat modul
const getModul = async (req, res) => {
  const praktikumId = req.params.praktikumId;
  try {
    const modul = await knex('modul')
        .where('modul.praktikum_id', praktikumId)
        .select('modul.id_modul', 'modul.judul_modul');

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: modul,
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

// menambahkan modul
/**
 * Extracts the relevant part of the module title.
 * @param {string} judulModul - The full module title.
 * @return {string} The relevant part of the module title.
 */
function extractRelevantModuleTitle(judulModul) {
  const parts = judulModul.split(':').map((part) => part.trim());
  return parts.length > 1 ? parts[1] : parts[0];
}

/**
 * Generates a code from a given name.
 * @param {string} name - The name to generate the code from.
 * @return {string} The generated code.
 */
function generateCodeFromName(name) {
  return name.split(' ').map((word) => word[0]).join('').toUpperCase();
}

/**
 * Retrieves the name of the praktikum.
 * @param {number} praktikumId - The ID of the praktikum.
 * @return {Promise<string|null>} The name of the praktikum.
 */
async function getPraktikumName(praktikumId) {
  const praktikum = await knex('praktikum')
      .where({praktikum_id: praktikumId}).first();
  return praktikum ? praktikum.praktikum_name : null;
}

/**
 * Adds a new module.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @return {Promise<Response>}
 */
const addModul = async (req, res) => {
  const praktikumId = req.params.praktikumId;
  const {judulModul} = req.body;

  try {
    const praktikumName = await getPraktikumName(praktikumId);
    if (!praktikumName) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Praktikum tidak ditemukan!',
        },
      });
    }

    // validasi input
    if (!judulModul) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: 'Semua field harus diisi!',
        },
      });
    }

    const praktikumCode = generateCodeFromName(praktikumName);
    const addedModules = [];

    const relevantTitle = extractRelevantModuleTitle(judulModul);
    const modulCode = generateCodeFromName(relevantTitle);
    const idModul = `${praktikumCode}-${modulCode}`;

    await knex('modul').insert({
      praktikum_id: praktikumId,
      judul_modul: judulModul,
      id_modul: idModul,
    });

    addedModules.push({
      id_modul: idModul,
      judul_modul: judulModul,
      praktikum_id: praktikumId,
    });

    return res.status(201).json({
      code: '201',
      status: 'Success',
      message: 'Semua modul berhasil ditambahkan.',
      data: addedModules,
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

// menghapus modul
const deleteModul = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  const id_modul = req.params.id_modul;

  try {
    const result = await knex('modul')
        .where({'id_modul': id_modul, 'praktikum_id': praktikum_id})
        .del();
    if (result == 1) {
      return res.status(200).json({
        code: '200',
        status: 'OK',
        data: {
          message: 'Modul removed',
        },
      });
    } else {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Modul does not exist in the database',
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

// buat jadwal praktikum
const addJadwalPraktikum = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  const {
    judul_modul,
    start_tgl,
    start_wkt,
    kuota,
  } = req.body;
  try {
    // validasi input
    if (!judul_modul || !start_tgl || !start_wkt || !kuota) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: 'Semua field harus diisi!',
        },
      });
    }

    // Mendapatkan judul modul dari tabel modul
    const modul = await knex('modul')
        .where({judul_modul: judul_modul})
        .first();

    if (!modul) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Modul tidak ditemukan!',
        },
      });
    }

    const id_modul = modul.id_modul;

    // Menghitung jumlah jadwal yang sudah ada untuk modul ini
    const existingJadwals = await knex('jadwalPraktikum')
        .where({id_modul})
        .count('* as total');

    const jadwalNumber = existingJadwals[0].total + 1;
    const id_modul_jadwal = `${id_modul}-${jadwalNumber}`;

    // Menyimpan ke database
    const [jadwalId] = await knex('jadwalPraktikum').insert({
      praktikum_id,
      id_modul,
      id_modul_jadwal,
      start_tgl,
      start_wkt,
      kuota,
    });

    const jadwalPraktikum = {
      jadwal_id: jadwalId,
      praktikum_id,
      id_modul,
      id_modul_jadwal,
      start_tgl,
      start_wkt,
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


// belum deploy
// mengedit jadwal praktikum (koor)
const editJadwal = async (req, res) => {
  const praktikum_id =req.params.praktikumId;
  const jadwal_id = req.params.jadwalId;
  const {
    judul_modul,
    start_tgl,
    start_wkt,
    kuota,
  } = req.body;
  try {
    // validasi input
    if (!judul_modul || !start_tgl || !start_wkt || !kuota) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: 'Semua field harus diisi!',
        },
      });
    }

    const jadwal = await knex('jadwalPraktikum')
        .where({jadwal_id: jadwal_id, praktikum_id: praktikum_id})
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
        .where({jadwal_id: jadwal_id})
        .update({
          id_modul, // Hanya perbarui jika modul berubah
          start_tgl,
          start_wkt,
          kuota,
        });

    const jadwalUpdated = await knex('jadwalPraktikum')
        .where({jadwal_id: jadwal_id, praktikum_id: praktikum_id})
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
/**
 * menentukan semester dan tahun akademik
 * @return {string}
 */
function determineSemesterAndAcademicYear() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  let semester;
  let academicYear;

  if (currentMonth >= 2 && currentMonth <= 7) {
    semester = 'Genap';
    academicYear = `${
      currentDate.getFullYear() - 1}-${currentDate.getFullYear()}`;
  } else {
    semester = 'Ganjil';
    academicYear = `${
      currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`;
  }

  return {semester, academicYear};
}
const ambilJadwal = async (req, res) => {
  const user_id = req.user.user_id;
  const praktikum_id = req.params.praktikumId;
  const {start_tgl, start_wkt, jadwal_id} = req.body;

  try {
    // Validasi input
    if (!start_tgl || !start_wkt || !jadwal_id) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        message: 'Semua informasi jadwal diperlukan.',
      });
    }

    const {semester, academicYear} = determineSemesterAndAcademicYear();

    // Mencari jadwal berdasarkan id_modul, start_tgl, dan waktu
    const jadwal = await knex('jadwalPraktikum')
        .where({jadwal_id, start_tgl, start_wkt})
        .first();

    if (!jadwal) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        message:
        'Jadwal tidak ditemukan atau tidak tersedia pada waktu tersebut.',
      });
    }

    if (jadwal.kuota <= 0) {
      return res.status(409).json({
        code: '409',
        status: 'Conflict',
        message: 'Kuota untuk jadwal ini sudah penuh.',
      });
    }

    // Memeriksa apakah praktikan sudah mengambil jadwal ini
    const sudahDiambil = await knex('mhsPilihPraktikum')
        .where({user_id, jadwal_id: jadwal.jadwal_id})
        .first();

    if (sudahDiambil) {
      return res.status(409).json({
        code: '409',
        status: 'Conflict',
        message: 'Anda sudah mengambil jadwal ini.',
      });
    }

    const alreadyEnrolled = await knex('mhsPilihPraktikum as mp')
        .join('jadwalPraktikum as jp', 'mp.jadwal_id', 'jp.jadwal_id')
        .where({
          'mp.user_id': user_id,
          'jp.id_modul': jadwal.id_modul,
        })
        .andWhereNot('jp.jadwal_id', jadwal_id)
        .andWhereNot('jp.start_tgl', jadwal.start_tgl)
        .first();

    if (alreadyEnrolled) {
      return res.status(409).json({
        code: '409',
        status: 'Conflict',
        message: 'Anda sudah terdaftar di modul ini pada hari yang berbeda.',
      });
    }

    // Mencari kelompok dengan kapasitas yang belum penuh
    let kelompok = await knex('kelompok')
        .leftJoin('mhsPilihPraktikum', 'kelompok.kelompok_id',
            'mhsPilihPraktikum.kelompok_id')
        .select('kelompok.*')
        .count('mhsPilihPraktikum.user_id as jumlah_anggota')
        .where('kelompok.jadwal_id', jadwal.jadwal_id)
        .groupBy('kelompok.kelompok_id')
        .having(knex.raw('jumlah_anggota < kelompok.kapasitas'))
        .first();

    // Jika tidak ada kelompok yang tersedia, buat kelompok baru
    if (!kelompok) {
      // Mencari nama kelompok terakhir untuk praktikum dan jadwal yang sama
      const lastKelompokName = await knex('kelompok')
          .where({jadwal_id})
          .max('nama_kelompok as lastGroupName')
          .first();

      // Menentukan nama kelompok baru berdasarkan kelompok terakhir
      const kelompokNumber = lastKelompokName.
          lastGroupName ? parseInt(lastKelompokName
              .lastGroupName.split(' ')[1]) + 1 : 1;
      const newGroupName = `Kelompok ${kelompokNumber}`;

      // Menambahkan kelompok baru dengan nama yang telah ditentukan
      const insertedIds = await knex('kelompok').insert({
        kapasitas: 5,
        jadwal_id: jadwal.jadwal_id,
        nama_kelompok: newGroupName,
      });

      const newKelompokId = insertedIds[0];
      kelompok = {kelompok_id: newKelompokId,
        kapasitas: 5, nama_kelompok: newGroupName};
    }

    // Mengambil jadwal
    await knex('mhsPilihPraktikum').insert({
      user_id,
      praktikum_id,
      jadwal_id: jadwal.jadwal_id,
      kelompok_id: kelompok.kelompok_id,
      semester: semester,
      tahun_akademik: academicYear,
    });

    // Mengurangi kuota
    const kuota = await knex('jadwalPraktikum')
        .where({jadwal_id})
        .decrement('kuota', 1);

    return res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Jadwal berhasil diambil.',
      data: {
        jadwal_id: jadwal.jadwal_id,
        praktikum_id,
        start_tgl,
        start_wkt,
        kuota: kuota - 1, // Menampilkan kuota yang telah diperbarui
        kelompok_id: kelompok.kelompok_id,
        nama_kelompok: kelompok.nama_kelompok,
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
  const praktikum_id = req.params.praktikumId;
  const user_id = req.user.user_id;
  try {
    // Query untuk mendapatkan semua jadwal yang tersedia
    const availableSchedules = await knex('jadwalPraktikum')
        .leftJoin('modul', 'jadwalPraktikum.id_modul', 'modul.id_modul')
        .select(
            'jadwalPraktikum.jadwal_id',
            'jadwalPraktikum.id_modul',
            'modul.judul_modul',
            'jadwalPraktikum.start_tgl',
            'jadwalPraktikum.start_wkt',
            'jadwalPraktikum.kuota',
        )
        .where('jadwalPraktikum.praktikum_id', praktikum_id)
        .orderBy('jadwalPraktikum.start_tgl', 'asc')
        .orderBy('jadwalPraktikum.start_wkt', 'asc');

    // Query untuk mendapatkan semua jadwal yang sudah diambil oleh praktikan
    const pickedSchedules = await knex('mhsPilihPraktikum')
        .join('jadwalPraktikum', 'mhsPilihPraktikum.jadwal_id',
            'jadwalPraktikum.jadwal_id')
        .select(
            'jadwalPraktikum.id_modul',
            'jadwalPraktikum.start_tgl',
        )
        .where('mhsPilihPraktikum.user_id', user_id)
        .andWhere('mhsPilihPraktikum.praktikum_id', praktikum_id);

    // Membuat set dari pickedSchedules untuk memudahkan pencarian
    const pickedScheduleSet = new Set(pickedSchedules
        .map((schedule) => schedule.id_modul));

    const filteredAvailableSchedules = availableSchedules
        .filter((schedule) => !pickedScheduleSet.has(schedule.id_modul));
    const filteredPickedSchedules = availableSchedules
        .filter((schedule) => pickedScheduleSet.has(schedule.id_modul));

    return res.status(200).json({
      status: 'success',
      data: {
        availableSchedules: filteredAvailableSchedules,
        pickedSchedules: filteredPickedSchedules,
      },
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

// melihat seluruh kelompok dari user (praktikan)
const lihatKelompok = async (req, res) => {
  const userId = req.user.user_id;
  try {
    // Ambil semua kelompok dan modul yang diikuti oleh user
    const kelompokDetails = await knex('mhsPilihPraktikum as mpp')
        .join('kelompok as k', 'mpp.kelompok_id', 'k.kelompok_id')
        .join('jadwalPraktikum as jp', 'k.jadwal_id', 'jp.jadwal_id')
        .join('modul as m', 'jp.id_modul', 'm.id_modul')
        .join('praktikum as p', 'jp.praktikum_id', 'p.praktikum_id')
        .join('users as u', 'mpp.user_id', 'u.user_id')
        .where('u.user_id', userId)
        .select('p.praktikum_id', 'p.praktikum_name', 'k.kelompok_id',
            'k.nama_kelompok', 'm.id_modul', 'm.judul_modul', 'jp.jadwal_id',
            'u.nrp', 'u.nama')
        .orderBy(['p.praktikum_id', 'm.id_modul', 'k.kelompok_id']);

    // Kelompokkan detail berdasarkan praktikum dan modul
    const groupedDetails = kelompokDetails.reduce((acc, detail) => {
      const {praktikum_id, praktikum_name, jadwal_id, id_modul, judul_modul,
        kelompok_id, nama_kelompok, nrp, nama} = detail;
      if (!acc[praktikum_id]) {
        acc[praktikum_id] = {
          praktikum_id,
          praktikum_name,
          modul: {},
        };
      }
      if (!acc[praktikum_id].modul[id_modul]) {
        acc[praktikum_id].modul[id_modul] = {
          id_modul,
          judul_modul,
          jadwal_id,
          kelompok: {},
        };
      }
      if (!acc[praktikum_id].modul[id_modul].kelompok[kelompok_id]) {
        acc[praktikum_id].modul[id_modul].kelompok[kelompok_id] = {
          kelompok_id,
          nama_kelompok,
          anggota: [],
        };
      }
      acc[praktikum_id].modul[id_modul]
          .kelompok[kelompok_id].anggota.push({nrp, nama});
      return acc;
    }, {});

    // Ubah objek terkelompok menjadi array
    const praktikumArray = Object.values(groupedDetails).map((praktikum) => ({
      praktikum_id: praktikum.praktikum_id,
      praktikum_name: praktikum.praktikum_name,
      modul: Object.values(praktikum.modul).map((modul) => ({
        id_modul: modul.id_modul,
        judul_modul: modul.judul_modul,
        jadwal_id: modul.jadwal_id,
        kelompok: Object.values(modul.kelompok),
      })),
    }));

    return res.status(200).json({
      status: 'success',
      data: praktikumArray,
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

// melihat jadwal praktikum (dashboard koor)
const jadwalPrakKoor = async (req, res) => {
  const praktikumId = req.params.praktikumId;
  try {
    const jadwal = await knex('jadwalPraktikum')
        .leftJoin('modul', 'jadwalPraktikum.id_modul', 'modul.id_modul')
        .leftJoin('praktikum', 'jadwalPraktikum.praktikum_id',
            'praktikum.praktikum_id')
        .where({'jadwalPraktikum.praktikum_id': praktikumId})
        .select('jadwalPraktikum.jadwal_id',
            'jadwalPraktikum.id_modul',
            'praktikum.praktikum_id', 'modul.judul_modul',
            'jadwalPraktikum.start_tgl', 'jadwalPraktikum.start_wkt as sesi');

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

module.exports = {
  getAllPraktikum, addPraktikum, deletePraktikum, addJadwalPraktikum,
  deleteJadwalPraktikum, getAllJadwal, ambilJadwal, lihatKelompok,
  jadwalPrakKoor, editJadwal, getJadwalPraktikum, editPraktikum,
  getModul, addModul, deleteModul,
};
