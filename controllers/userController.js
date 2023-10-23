const jwt = require('jsonwebtoken');
const saltRounds = 10;
const bcrypt = require('bcrypt');
// const {knex} = require('../configs/data-source.js');
const {
  validateEmail,
  validatePassword,
  validateNRP,
} = require('../utils/validation.js');

const register = async (req, res) => {
  const {nama, nrp, email, password, nohp, departemen} = req.body;
  // Check all attribute
  if (!nama || !nrp || !email || !password || !nohp || !departemen) {
    return res.status(400).send({
      code: '400',
      status: 'Bad Request',
      errors: {
        message: 'Missing attribute',
      },
    });
  }

  // Validate NRP format
  if (validateNRP(nrp)) {
    return res.status(400).send({
      code: '400',
      status: 'Bad Request',
      errors: {
        message: 'Invalid NRP',
      },
    });
  }

  // Validate Email format
  if (validateEmail(email)) {
    return res.status(400).send({
      code: '400',
      status: 'Bad Request',
      errors: {
        message: 'Invalid Email, use NRP@student.its.ac.id email',
      },
    });
  }

  // Validate Password
  if (validatePassword(password)) {
    return res.status(400).send({
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
    return res.status(409).send({
      code: '409',
      status: 'Conflict',
      errors: {
        message: 'NRP already exists',
      },
    });
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
      knex('users').insert(user).then(res.status(200).send({
        code: '200',
        status: 'OK',
        data: {
          message: 'Register Success. Please Log in',
        },
      }));
    });
  });
};

const login = async (req, res) => {
  const nrp = req.body.nrp;
  const password = req.body.password;

  // Validate NRP
  const validUser = await knex('users').where('nrp', nrp);
  if (validUser.length === 0) {
    return res.status(401).send({
      code: '401',
      status: 'Unauthorized',
      errors: {
        message: 'Incorrect NRP or password',
      },
    });
  }

  // Check Password
  bcrypt.compare(password, validUser[0].password, function(err, result) {
    if (result) {
      const user = {
        nrp: validUser[0].nrp,
        name: validUser[0].name,
        user_id: validUser[0].user_id,
        created_at: validUser[0].created_at,
      };

      // Make JWT
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
          {expiresIn: '1hr'});
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET,
          {expiresIn: '365d'});

      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
          function(err, decoded) {
            const data = {
              user_id: validUser[0].user_id,
              token: refreshToken,
              created_at: new Date(decoded.iat * 1000).toISOString()
                  .slice(0, 19).replace('T', ' '),
              expires_at: new Date(decoded.exp * 1000).toISOString()
                  .slice(0, 19).replace('T', ' '),
            };
            knex('tokens').insert(data).then(res.status(200).send({
              code: '200',
              status: 'OK',
              data: {
                accessToken: accessToken,
                refreshToken: refreshToken,
              },
            }));
          });
    } else {
      return res.status(401).send({
        code: '401',
        status: 'Unauthorized',
        errors: {
          message: 'Incorrect nrp or password',
        },
      });
    }
  });
};

module.exports = {
  login, register,
};
