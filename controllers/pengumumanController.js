/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

const getAllPengumuman = async (req, res) => {
  try {
    const pengumuman = await knex('pengumuman')
        .select('judul', 'deskripsi');

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: pengumuman,
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

const addPengumuman = async (req, res) => {
  const {
    judul,
    deskripsi,
  } = req.body;
  try {
    // validasi input
    if (!judul || !deskripsi) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: 'Semua field harus diisi!',
        },
      });
    }

    // menyimpan ke database
    const [pengumumanId] = await knex('pengumuman')
        .insert({
          judul,
          deskripsi,
        });

    const isiPengumuman = {
      pengumuman_id: pengumumanId,
      judul,
      deskripsi,
    };

    return res.status(201).json({
      code: '201',
      status: 'Success',
      data: isiPengumuman,
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

const editPengumuman = async (req, res) => {
  const pengumumanId = req.params.pengumumanId;
  const {judul, deskripsi} = req.body;

  try {
    // validasi input
    if (!judul || !deskripsi) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: 'Judul dan isi pengumuman harus diisi!',
        },
      });
    }

    // mencari pengumuman yang ada
    const pengumuman = await knex('pengumuman')
        .where({pengumuman_id: pengumumanId})
        .first();

    // jika pengumuman tidak ditemukan
    if (!pengumuman) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Pengumuman tidak ditemukan',
        },
      });
    }

    // memperbarui pengumuman di database
    await knex('pengumuman')
        .where({pengumuman_id: pengumumanId})
        .update({
          judul,
          deskripsi,
        });

    /* mengambil pengumuman yang telah diperbarui
    untuk dikirimkan sebagai response */
    const pengumumanUpdated = await knex('pengumuman')
        .where({pengumuman_id: pengumumanId})
        .first();

    return res.status(200).json({
      code: '200',
      status: 'Success',
      data: pengumumanUpdated,
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

const deletePengumuman = async (req, res) => {
  const pengumumanId = req.params.pengumumanId;
  try {
    const result = await knex('pengumuman')
        .where('pengumuman_id', pengumumanId)
        .del();
    if (result == 1) {
      return res.status(200).json({
        code: '200',
        status: 'OK',
        data: {
          message: 'Pengumuman removed',
        },
      });
    } else {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: 'Pengumuman does not exist in the database',
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
  getAllPengumuman,
  addPengumuman,
  editPengumuman,
  deletePengumuman,
};
