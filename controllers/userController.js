/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');
const saltRounds = 10;
const bcrypt = require('bcrypt');
const {knex} = require('../configs/data-source.js');
// const multer = require('multer');
const {
  validateEmail,
  validatePassword,
  validateNRP,
} = require('../utils/validation.js');

// sign up
const register = async (req, res) => {
  const {nama, nrp, email, password, nohp, departemen} = req.body;
  // Check all attribute
  if (!nama || !nrp || !email || !password || !nohp || !departemen) {
    return res.status(400).json({
      code: '400',
      status: 'Bad Request',
      errors: {
        message: 'Missing attribute',
      },
    });
  }

  // Validate NRP / NIP format
  if (validateNRP(nrp)) {
    return res.status(400).json({
      code: '400',
      status: 'Bad Request',
      errors: {
        message: 'Invalid NRP',
      },
    });
  }

  // Validate Email format
  if (validateEmail(email)) {
    return res.status(400).json({
      code: '400',
      status: 'Bad Request',
      errors: {
        message: 'Invalid Email, use ITS email',
      },
    });
  }

  // Validate Password
  if (validatePassword(password)) {
    return res.status(400).json({
      code: '400',
      status: 'Bad Request',
      errors: {
        message:
        'The password must be minimum 8 characters and contain numbers',
      },
    });
  }

  // Validate NRP Exists
  const verifNRP = await knex('users').where('nrp', nrp);
  if (verifNRP.length !== 0) {
    return res.status(409).json({
      code: '409',
      status: 'Conflict',
      errors: {
        message: 'NRP already exists',
      },
    });
  }

  // Assign default role based on NRP / NIP
  let role = 'praktikan';
  if (nrp.startsWith('502')) {
    role = 'praktikan';
  } else if (nrp.startsWith('19')) {
    role = 'dosen';
  }

  const user = {
    nama,
    nrp,
    email,
    password,
    nohp,
    departemen,
  };

  // Password hashing
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) throw err;
      user.password = hash;
      // Store user to DB
      knex('users').insert(user).then((ids) => {
        const user_id = ids[0];
        return knex('roles').insert({
          role_name: role,
          user_id: user_id,
        });
      }).then(() => {
        res.status(200).json({
          code: '200',
          status: 'OK',
          data: {
            message: 'Register Success. Please Log in',
            role: role,
          },
        });
      }).catch((error) => {
        console.error(error);
        res.status(500).json({
          code: '500',
          status: 'Internal Server Error',
          errors: {
            message: 'An error occurred while registering the user',
          },
        });
      });
    });
  });
};

// sign in
const login = async (req, res) => {
  const nrp = req.body.nrp;
  const password = req.body.password;

  // Validate NRP
  const validUser = await knex('users').where('nrp', nrp).first();
  if (validUser.length === 0) {
    return res.status(401).json({
      code: '401',
      status: 'Unauthorized',
      errors: {
        message: 'Incorrect NRP or password',
      },
    });
  }

  // Check Password
  bcrypt.compare(password, validUser.password, async function(err, result) {
    if (result) {
      // Get roles list from roles table
      const rolesList = await knex('roles')
          .where('user_id', validUser.user_id).pluck('role_name');

      const user = {
        nrp: validUser.nrp,
        name: validUser.nama,
        user_id: validUser.user_id,
        roles: rolesList, // Array of roles
        created_at: validUser.created_at,
      };

      // Make JWT
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
          {expiresIn: '2hr'});
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET,
          {expiresIn: '365d'});

      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
          function(err, decoded) {
            const data = {
              user_id: validUser.user_id,
              token: refreshToken,
              created_at: new Date(decoded.iat * 1000).toISOString()
                  .slice(0, 19).replace('T', ' '),
              expires_at: new Date(decoded.exp * 1000).toISOString()
                  .slice(0, 19).replace('T', ' '),
            };
            knex('tokens').insert(data).then(res.status(200).json({
              code: '200',
              status: 'OK',
              data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                userRoles: rolesList,
              },
            }));
          });
    } else {
      return res.status(401).json({
        code: '401',
        status: 'Unauthorized',
        errors: {
          message: 'Incorrect nrp or password',
        },
      });
    }
  });
};

// token
const token = async (req, res) => {
  const nrp = req.user.nrp;
  if (!nrp) {
    // Handle jika nrp tidak didefinisikan atau tidak valid
    return res.status(400).json({error: 'NRP is required'});
  }
  try {
    // Retrieve user with roles
    const userWithRoles = await knex('users as u')
        .leftJoin('roles as r', 'u.user_id', 'r.user_id')
        .where('u.nrp', nrp)
        .select('u.*', knex.raw('GROUP_CONCAT(r.role_name) as roles'))
        .groupBy('u.user_id')
        .first();

    if (!userWithRoles) {
      return res.status(404).json({
        code: '404',
        status: 'Not Found',
        errors: {message: 'User not found'},
      });
    }

    // Split the roles string into an array
    const rolesArray = userWithRoles.roles.split(',');

    // Prepare the payload for JWT
    const userForToken = {
      nrp: userWithRoles.nrp,
      name: userWithRoles.name,
      user_id: userWithRoles.user_id,
      roles: rolesArray,
    };

    // Generate new Access Token
    const accessToken = jwt.sign(userForToken,
        process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '2hr',
        });

    return res.status(200).json({
      code: '200',
      status: 'OK',
      data: {
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: '500',
      status: 'Internal Server Error',
      errors: {message: 'An error occurred while generating new token'},
    });
  }
};

// log out
const logout = async (req, res) => {
  const refreshToken = req.refreshToken;
  try {
    const result = await knex('tokens')
        .where('token', refreshToken)
        .del();

    if (result == 1) {
      return res.status(200).json({
        code: '200',
        status: 'OK',
        data: {
          message: 'Sign out success',
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

// melihat profile sendiri (all role)
const profile = async (req, res) => {
  const nrp = req.user.nrp;
  const userId = req.user.user_id;

  try {
    const result = await knex('users').where('nrp', nrp);
    const rolesList = await knex('roles')
        .where('user_id', userId).pluck('role_name');

    if (result.length == 1) {
      const user = result[0];

      return res.status(200).json({
        code: '200',
        status: 'OK',
        data: {
          user_id: user.user_id,
          name: user.nama,
          nrp: user.nrp,
          departemen: user.departemen,
          nohp: user.nohp,
          email: user.email,
          roles: rolesList,
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

// melihat profile asisten
const assistantProfile = async (req, res) => {
  const userId = req.user.user_id;

  // Mengambil pilihan praktikum praktikan
  const studentChoice = await knex('mhsPilihPraktikum')
      .where('user_id', userId).first();

  if (!studentChoice) {
    return res.status(404).json({
      code: '404',
      status: 'Not Found',
      message: 'Praktikan belum mempunyai kelompok.',
    });
  }

  // Mengambil jadwal_id dari pilihan praktikan
  const scheduleId = studentChoice.jadwal_id;

  // Mengambil user_id asisten dari tabel asistenJadwal berdasarkan jadwal_id
  const assistantSchedule = await knex('asistenJadwal')
      .where('jadwal_id', scheduleId).first();

  if (!assistantSchedule) {
    return res.status(404).json({
      code: '404',
      status: 'Not Found',
      message: 'Asisten untuk jadwal ini tidak ditemukan',
    });
  }

  const assistantUserId = assistantSchedule.user_id;

  // Mengambil profil asisten dari tabel users
  const assistant = await knex('users')
      .where('user_id', assistantUserId).first();

  if (!assistant) {
    return res.status(404).json({
      code: '404',
      status: 'Not Found',
      message: 'Profil asisten tidak ditemukan',
    });
  }

  // Kirim profil asisten sebagai response
  return res.status(200).json({
    code: '200',
    status: 'OK',
    data: {
      user_id: assistant.user_id,
      name: assistant.nama,
      nrp: assistant.nrp,
      departemen: assistant.departemen,
      nohp: assistant.nohp,
      email: assistant.email,
      profile_picture: assistant.profil_picture,
    },
  });
};

// upload gambar
/* const uploadProfilePicture = async (req, res) => {

}; */

module.exports = {
  login, register, token, logout, profile, assistantProfile,
};
