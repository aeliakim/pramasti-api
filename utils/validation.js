const validateNRP = (usernameNRP) => {
  return !nrp.match(
      // NRP must be between 10-15 numbers
      /^\d{10,15}$/,
  );
};

const validateEmail = (email) => {
  return !email.match(
      /^[\w-\.]+@student.its.ac.id$/,
  );
};

const validatePassword = (password) => {
  return !password.match(
      // The password must be minimum 8 characters and contain numbers
      /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,}$/,
  );
};

module.exports = {
  validateNRP,
  validateEmail,
  validatePassword,
};

