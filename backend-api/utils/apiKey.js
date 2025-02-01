const crypto = require("crypto");
/**
 * Generates a secure random API key.
 * @returns {string} - A 64-character hexadecimal string.
 */
const generateApiKey = () => {
    return crypto.randomBytes(32).toString("hex"); // Generates a 64-character API key
  };

module.exports = generateApiKey