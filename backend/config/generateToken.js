const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  // Create a payload object containing the user ID
  const payload = { id };

  // Sign the payload to generate the JWT token
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = generateToken;
