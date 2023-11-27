/* mengedit nilai, menambah nilai,
melihat daftar peserta berdasarkan tahun ajaran, */

/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// menampilkan daftar peserta
const getPeserta = async (req, res) => {
  const praktikumId = req.params.praktikumId;
  try {
    const peserta = await knex('mhsPilihPraktikum as mp')
        .leftJoin('users as u', 'u.user_id', 'mp.user_id')
        .leftJoin('praktikum as p', 'p.praktikum_id', 'mp.praktikum_id')
        .leftJoin('nilai as n', function() {
          this.on('mp.user_id', '=', 'n.user_id')
              .andOn('mp.praktikum_id', '=', 'n.praktikum_id');
        })
        .where({'p.praktikum_id': praktikumId})
        .select(
            'u.user_id',
            'u.nama',
            'u.nrp',
            'u.departemen',
            'n.nilai',
        )
        .orderBy('u.nrp', 'asc');

    if (peserta.length === 0) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        message: 'Tidak ada peserta yang terdaftar di praktikum ini.',
      });
    }

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: peserta,
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

// menambahkan nilai
const addNilai = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  const {user_id, nilai} = req.body;
  try {
    // Validasi input
    if (!user_id || !praktikum_id || nilai === undefined) {
      return res.status(400).json({
        message: 'Informasi user_id, praktikum_id, dan nilai diperlukan.',
      });
    }

    // Memeriksa apakah nilai sudah ada
    const existingNilai = await knex('nilai')
        .where({user_id, praktikum_id})
        .first();

    if (existingNilai) {
      return res.status(409).json({
        message: 'Nilai untuk mahasiswa dan praktikum ini sudah ada.',
      });
    }

    // Menyimpan nilai baru ke dalam database
    const [nilaiId] = await knex('nilai').insert({
      user_id,
      praktikum_id,
      nilai,
    });

    const insertedNilai = {
      nilai_id: nilaiId,
      user_id,
      praktikum_id,
      nilai,
    };

    return res.status(201).json({
      code: '201',
      message: 'Nilai berhasil ditambahkan.',
      data: insertedNilai,
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

// mengedit nilai
const editNilai = async (req, res) => {
  const nilai_id = req.params.nilaiId;
  const {nilai} = req.body;

  try {
    // Validasi input
    if (nilai === undefined) {
      return res.status(400).json({
        message: 'Nilai diperlukan.',
      });
    }

    // Memeriksa apakah nilai ada
    const existingNilai = await knex('nilai').where({nilai_id}).first();
    if (!existingNilai) {
      return res.status(404).json({
        message: 'Nilai tidak ditemukan.',
      });
    }

    // Mengedit nilai yang ada di database
    await knex('nilai').where({nilai_id}).update({nilai});

    return res.status(200).json({
      message: 'Nilai berhasil diperbarui.',
      nilai: {nilai_id, nilai},
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

module.exports = {
  getPeserta, addNilai, editNilai,
};
