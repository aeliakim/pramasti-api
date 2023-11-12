/* menambah asisten, menghapus asisten, menambah koor, menghapus koor,
menambah dosen, menghapus dosen, menampilkan list roles*/

/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// menampilkan manajemen role
const getRoleLists = async (req, res) => {
  const {praktikumId} = req.params.praktikumId;
  try {
    const role = req.user.role;
    let data;

    switch (role) {
      case 'koordinator':
        data = await knex('users')
            .join('roles', 'users.user_id', 'roles.user_id')
            .where('roles.role_name', 'asisten')
            .andWhere('roles.praktikum_id', praktikumId)
            .select('users.nama', 'users.nrp', 'roles.role_name');
        break;
      case 'dosen':
        data = await knex('users')
            .join('roles', 'users.user_id', 'roles.user_id')
            .whereNot('roles.role_name', 'praktikan')
            .andWhere('roles.praktikum_id', praktikumId)
            .select('users.nama', 'users.nrp', 'roles.role_name');
        break;
      case 'admin':
        data = await knex('users')
            .join('roles', 'users.user_id', 'roles.user_id')
            .where('roles.praktikum_id', praktikumId)
            .select('users.nama', 'users.nrp', 'roles.role_name');
        break;
      default:
        return res.status(403).json({
          code: '403',
          status: 'Forbidden',
          errors: {
            message: 'Anda tidak memiliki hak akses untuk data ini',
          },
        });
    }

    if (data.length > 0) {
      res.status(200).json({
        code: '200',
        status: 'OK',
        data: data,
      });
    } else {
      res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message:
          'Data untuk role ini tidak ditemukan dalam praktikum yang dipilih',
        },
      });
    }
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

// menambah asisten
const addAsisten = async (req, res) => {
  const {praktikumId} = req.params.praktikumId;
  const {nrpList} = req.body;
  try {
    // Pengecekan setiap NRP dan tambahkan sebagai asisten jika belum ada
    for (const nrp of nrpList) {
      const user = await knex('users').where('nrp', nrp).first();

      // Jika user dengan NRP tersebut tidak ditemukan
      if (!user) {
        return res.status(404).json({
          code: '404',
          status: 'Not Found',
          errors: {
            message: `User dengan NRP ${nrp} tidak ditemukan`,
          },
        });
      }

      // Tambahkan role asisten ke user
      await knex('roles').insert({
        user_id: user.user_id,
        role_name: 'asisten',
        praktikum_id: praktikumId,
      });
    }
    // Kirim respon sukses jika semua NRP diproses
    res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Asisten berhasil ditambahkan',
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

// menghapus asisten
const deleteAsisten = async (req, res) => {
  const {praktikumId} = req.params.praktikumId;
  const {nrp} = req.params.nrp;

  try {
    const user = await knex('users').where('nrp', nrp).first();

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: `User dengan NRP ${nrp} tidak ditemukan`,
        },
      });
    }

    // Hapus role asisten dari user
    const result = await knex('roles')
        .where({
          user_id: user.user_id,
          role_name: 'asisten',
          praktikum_id: praktikumId,
        })
        .del();

    if (!result) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: `User dengan NRP ${nrp} bukan asisten atau
          sudah dicopot perannya`,
        },
      });
    }

    res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Peran asisten berhasil dicopot',
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

// menambah koordinator
const addKoor = async (req, res) => {
  const {praktikumId} = req.params.praktikumId;
  const {nrpList} = req.body;
  try {
    // Pengecekan setiap NRP dan tambahkan sebagai koordinator jika belum ada
    for (const nrp of nrpList) {
      const user = await knex('users').where('nrp', nrp).first();

      // Jika user dengan NRP tersebut tidak ditemukan
      if (!user) {
        return res.status(404).json({
          code: '404',
          status: 'Not Found',
          errors: {
            message: `User dengan NRP ${nrp} tidak ditemukan`,
          },
        });
      }

      // Tambahkan role koordinator ke user
      await knex('roles').insert({
        user_id: user.user_id,
        role_name: 'koordinator',
        praktikum_id: praktikumId,
      });
    }

    // Kirim respon sukses jika semua NRP diproses
    res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Koordinator berhasil ditambahkan',
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

// menghapus koordinator
const deleteKoor = async (req, res) => {
  const {praktikumId} = req.params.praktikumId;
  const {nrp} = req.params;

  try {
    const user = await knex('users').where('nrp', nrp).first();

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: `User dengan NRP ${nrp} tidak ditemukan`,
        },
      });
    }

    // Hapus role koordinator dari user
    const result = await knex('roles')
        .where({
          user_id: user.user_id,
          role_name: 'koordinator',
          praktikum_id: praktikumId,
        })
        .del();

    if (!result) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: `User dengan NRP ${nrp} bukan koordinator atau
          sudah dicopot perannya`,
        },
      });
    }

    res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Peran koordinator berhasil dicopot',
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

// menambah dosen
const addDosen = async (req, res) => {
  const {praktikumId} = req.params.praktikumId;
  const {nrpList} = req.body;
  try {
    // Pengecekan setiap NIP dan tambahkan sebagai asisten jika belum ada
    for (const nrp of nrpList) {
      const user = await knex('users').where('nrp', nrp).first();

      // Jika user dengan NRP tersebut tidak ditemukan
      if (!user) {
        return res.status(404).json({
          code: '404',
          status: 'Not Found',
          errors: {
            message: `User dengan NRP ${nrp} tidak ditemukan`,
          },
        });
      }

      // Tambahkan role dosen ke user
      await knex('roles').insert({
        user_id: user.user_id,
        role_name: 'dosen',
        praktikum_id: praktikumId,
      });
    }

    // Kirim respon sukses jika semua NRP diproses
    res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Dosen berhasil ditambahkan',
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

// menghapus dosen
const deleteDosen = async (req, res) => {
  const {praktikumId} = req.params.praktikumId;
  const {nrp} = req.params.nrp;

  try {
    const user = await knex('users').where('nrp', nrp).first();

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {
          message: `User dengan NRP ${nrp} tidak ditemukan`,
        },
      });
    }

    // Hapus role dosen dari user
    const result = await knex('roles')
        .where({
          user_id: user.user_id,
          role_name: 'dosen',
          praktikum_id: praktikumId,
        })
        .del();

    if (!result) {
      return res.status(400).json({
        code: '400',
        status: 'Bad Request',
        errors: {
          message: `User dengan NRP ${nrp} bukan dosen atau
          sudah dicopot perannya`,
        },
      });
    }

    res.status(200).json({
      code: '200',
      status: 'OK',
      message: 'Peran dosen berhasil dicopot',
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
  getRoleLists, addAsisten, deleteAsisten, addKoor, deleteKoor,
  addDosen, deleteDosen,
};
