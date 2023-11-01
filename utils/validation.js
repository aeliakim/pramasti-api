const validateNRP = (nrp) => {
  return !nrp.match(
      // NRP / NIP must be between 10-20 numbers
      /^\d{10,20}$/,
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

