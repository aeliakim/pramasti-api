const jwt = require('jsonwebtoken');
const {knex} = require('../configs/data-source.js');
require('dotenv').config();

const authenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.status(401).send({
      code: '401',
      status: 'Unauthorized',
      errors: {
        message: 'No token provided',
      },
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,
      async function(err, decoded) {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            // Handle the expired token error
            return res.status(401).send({
              code: '401',
              status: 'Unauthorized',
              errors: {
                message: 'Token expired. Please get new access token',
              },
            });
          } else if (err.name === 'JsonWebTokenError') {
            // Handle the invalid token error
            return res.status(401).send({
              code: '401',
              status: 'Unauthorized',
              errors: {
                message: 'Token invalid',
              },
            });
          }

          console.log(err);
          return res.status(401).send({
            code: '401',
            status: 'Unauthorized',
            errors: {
              message: 'Unknown Error',
            },
          });
        }
        // Get roles list from roles table
        const rolesList = await knex('roles')
            .where('user_id', decoded.user_id).pluck('role_name');

        req.user = {
          nrp: decoded.nrp,
          name: decoded.name,
          user_id: decoded.user_id,
          roles: rolesList, // Array of roles
          created_at: decoded.created_at,
        };
        next();
      });
};

const authenticateRefreshToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.status(401).send({
      code: '401',
      status: 'Unauthorized',
      errors: {
        message: 'No token provided',
      },
    });
  }
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET,
      async function(err, decoded) {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            // Handle the expired token error
            return res.status(401).send({
              code: '401',
              status: 'Unauthorized',
              errors: {
                message: 'Token expired. Please sign in again',
              },
            });
          } else if (err.name === 'JsonWebTokenError') {
            // Handle the invalid token error
            return res.status(401).send({
              code: '401',
              status: 'Unauthorized',
              errors: {
                message: 'Token invalid. Please sign in again',
              },
            });
          }

          console.log(err);
          return res.status(401).send({
            code: '401',
            status: 'Unauthorized',
            errors: {
              message: 'Unknown Error. Please sign in again',
            },
          });
        }

        const checkOnDatabase = await knex('tokens').where('token', token);
        if (checkOnDatabase.length == 0) {
          return res.status(401).send({
            code: '401',
            status: 'Unauthorized',
            errors: {
              message: 'Token Revoked. Please sign in again',
            },
          });
        } else {
          req.refreshToken = token;
        }
        // Get roles list from roles table
        const rolesList = await knex('roles')
            .where('user_id', decoded.user_id).pluck('role_name');

        req.user = {
          nrp: decoded.nrp,
          name: decoded.name,
          user_id: decoded.user_id,
          roles: rolesList, // Array of roles
          created_at: decoded.created_at,
        };
        next();
      });
};

const optionalAuthenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    next();
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // Handle the expired token error
          return res.status(401).send({
            code: '401',
            status: 'Unauthorized',
            errors: {
              message: 'Token expired. Please get new access token',
            },
          });
        } else if (err.name === 'JsonWebTokenError') {
          // Handle the invalid token error
          return res.status(401).send({
            code: '401',
            status: 'Unauthorized',
            errors: {
              message: 'Token invalid',
            },
          });
        }

        console.log(err);
        return res.status(401).send({
          code: '401',
          status: 'Unauthorized',
          errors: {
            message: 'Unknown Error',
          },
        });
      }

      req.nrp = decoded.nrp;
      req.name = decoded.name;
      req.user_id = decoded.user_id;
      req.created_at = decoded.created_at;
      req.role = decoded.role;
      next();
    });
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Check if req.user.roles has any role that is included in allowedRoles
    const hasAuthorizedRole = req.user.roles
        .some((role) => allowedRoles.includes(role));
    if (hasAuthorizedRole) {
      next();
    } else {
      res.status(403).send({
        code: '403',
        status: 'Forbidden',
        errors: {
          message: 'Access denied. You do not have the required role.',
        },
      });
    }
  };
};

module.exports = {authenticateAccessToken,
  authenticateRefreshToken,
  optionalAuthenticateAccessToken, authorize};

