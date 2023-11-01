/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// melihat daftar praktikum yang tersedia
const getAllPraktikum = async (req, res) => {
  try {

  } catch (error) {
    console.error(error);
    return res.status(500).send({
      code: '500',
      status: 'Internal Server Error',
      errors: {
        message: 'An error occurred while adding data',
      },
    });
  }
};
// melihat jadwal praktikum

// buat jadwal praktikum
const addJadwalPraktikum = async (req, res) => {
  try {
    const {
      praktikum_id,
      tanggal,
      waktu_mulai,
      ruang,
    } = req.body;

    // validasi input
    if (!praktikum_id || !tanggal || !waktu_mulai || !ruang) {
      return res.status(400).send({
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
      tanggal,
      waktu_mulai,
      ruang,
    });

    const jadwalPraktikum = {
      jadwal_id: jadwalId,
      praktikum_id,
      tanggal,
      waktu_mulai,
      ruang,
    };

    return res.status(201).send({
      code: '201',
      status: 'Success',
      data: jadwalPraktikum,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
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
      return res.status(200).send({
        code: '200',
        status: 'OK',
        data: {
          message: 'Jadwal removed',
        },
      });
    } else {
      return res.status(404).send({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Jadwal does not exist in the database',
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
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
      praktikum_tglmulai,
      praktikum_tglselesai,
      deskripsi} = req.body;

    // validasi input
    if (!praktikum_name || !praktikum_tglmulai ||
      !praktikum_tglselesai || !deskripsi) {
      return res.status(400).send({
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
      praktikum_tglmulai,
      praktikum_tglselesai,
      deskripsi,
    });

    const praktikum = {praktikum_id: praktikumId, praktikum_name,
      praktikum_tglmulai, praktikum_tglselesai, deskripsi};

    return res.status(201).send({
      code: '201',
      status: 'Success',
      data: praktikum,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
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
      return res.status(200).send({
        code: '200',
        status: 'OK',
        data: {
          message: 'Praktikum removed',
        },
      });
    } else {
      return res.status(404).send({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Praktikum does not exist in the database',
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
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
  deleteJadwalPraktikum,
};
