/* mengedit nilai, menambah nilai,
melihat daftar peserta berdasarkan tahun ajaran, */

/* eslint-disable camelcase */
const {knex} = require('../configs/data-source.js');

// menampilkan daftar peserta
const getPeserta = async (req, res) => {
  const praktikumId = req.params.praktikumId;
  const {semester, tahun_akademik} = req.query;
  try {
    let query = knex('mhsPilihPraktikum as mp')
        .leftJoin('users as u', 'u.user_id', 'mp.user_id')
        .leftJoin('praktikum as p', 'p.praktikum_id', 'mp.praktikum_id')
        .leftJoin('nilai_akhir as n', function() {
          this.on('mp.user_id', '=', 'n.user_id')
              .andOn('mp.praktikum_id', '=', 'n.praktikum_id');
        })
        .where('mp.praktikum_id', praktikumId)
        .distinct('mp.user_id', 'mp.praktikum_id',
            'u.nama', 'u.nrp', 'u.departemen', 'n.nilai_akhir');

    // Jika filter semester dan tahun akademik disediakan, tambahkan ke query
    if (semester) {
      query = query.where('mp.semester', semester);
    }
    if (tahun_akademik) {
      query = query.where('mp.tahun_akademik', tahun_akademik);
    }

    const peserta = await query.select(
        'p.praktikum_id',
        'u.user_id',
        'u.nama',
        'u.nrp',
        'u.departemen',
        'n.nilai_akhir',
    ).orderBy('u.nrp', 'asc');

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
const addOrUpdateNilai = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  const user_id = req.params.userId;
  const {id_modul, nilai_modul} = req.body;
  const numericNilai = parseInt(nilai_modul, 10);
  try {
    // Validasi input nilai sebagai numerik
    if (isNaN(numericNilai)) {
      return res.status(400).json({message: 'Nilai harus berupa angka.'});
    }

    // Cek apakah nilai modul sudah ada
    const existingNilaiModul = await knex('nilai')
        .where({user_id, praktikum_id, id_modul})
        .first();

    if (existingNilaiModul) {
      // Update nilai modul yang sudah ada
      await knex('nilai')
          .where({user_id, praktikum_id, id_modul})
          .update({nilai_modul: numericNilai});
    } else {
      // Insert nilai modul baru jika belum ada
      await knex('nilai').insert({
        user_id,
        praktikum_id,
        id_modul,
        nilai_modul: numericNilai,
      });
    }

    // Hitung nilai akhir berdasarkan semua nilai modul yang telah diinputkan
    const nilaiModulRows = await knex('nilai')
        .where({user_id, praktikum_id})
        .select('nilai_modul');

    const totalNilai = nilaiModulRows.reduce((
        acc, row) => acc + row.nilai_modul, 0);
    const nilaiAkhir = nilaiModulRows.length ? totalNilai /
     nilaiModulRows.length : 0;

    // Insert nilai akhir
    const existingNilaiAkhir = await knex('nilai_akhir')
        .where({user_id, praktikum_id})
        .first();

    if (existingNilaiAkhir) {
      // Update nilai modul yang sudah ada
      await knex('nilai_akhir')
          .where({user_id, praktikum_id})
          .update({nilai_akhir: nilaiAkhir});
    } else {
      // Insert nilai modul baru jika belum ada
      await knex('nilai_akhir').insert({
        user_id,
        praktikum_id,
        nilai_akhir: nilaiAkhir,
      });
    }

    return res.status(200).json({
      message: 'Nilai modul berhasil diupdate.',
      user_id,
      praktikum_id,
      id_modul,
      nilai_modul: nilai_modul,
      nilai_akhir: nilaiAkhir,
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

const getNilai = async (req, res) => {
  const praktikum_id = req.params.praktikumId;
  const user_id = req.params.userId;

  try {
    const modulNilaiPeserta = await knex('modul as m')
        .leftJoin('nilai as n', function() {
          this.on('n.id_modul', '=', 'm.id_modul')
              .andOn('n.user_id', '=', knex.raw('?', [user_id]));
        })
        .where('m.praktikum_id', praktikum_id)
        .select(
            'm.id_modul as id_modul',
            'm.judul_modul as nama_modul',
            'n.nilai_modul',
        )
        .orderBy('m.id_modul', 'asc');

    // Mengambil informasi peserta
    const pesertaInfo = await knex('users')
        .where('user_id', user_id)
        .select('nama', 'nrp')
        .first();

    // Gabungkan informasi peserta dengan nilai modulnya
    const hasil = {
      peserta: pesertaInfo,
      modul: modulNilaiPeserta,
    };

    // Kembalikan hasil query
    return res.status(200).json({
      status: 'Success',
      data: hasil,
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
  getPeserta, addOrUpdateNilai, getNilai,
};
