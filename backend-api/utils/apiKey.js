const crypto = require("crypto");

const IV_LENGTH = 16; // AES IV must be 16 bytes
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex") || crypto.randomBytes(32); // Ensure 32-byte key

/**
 * Generates a secure random API key.
 * @returns {string} - A 64-character hexadecimal string.
 */
const generateApiKey = () => {
    return crypto.randomBytes(32).toString("hex"); // Generates a 64-character API key
  };

// Function to encrypt data (API Key)
const encrypt = (text) => {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex"); // Store IV with encrypted data
}

// Function to decrypt API Key
const decrypt = (text) => {
  try {
      let [iv, encryptedText] = text.split(":");
      let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, "hex"));
      let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
  } catch (error) {
      console.error("Decryption failed:", error);
      return null;
  }
}

module.exports = {generateApiKey, encrypt, decrypt}