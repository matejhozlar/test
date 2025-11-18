import crypto from "node:crypto";

/**
 * Generate a secure random password
 *
 * @param {number} length - Length of the password (default 16)
 * @returns {string} Generated password
 */
export const generatePassword = (length = 32) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[crypto.randomInt(chars.length)];
  }

  return password
    .split("")
    .sort(() => crypto.randomInt(3) - 1)
    .join("");
};

/**
 * Generate a secure random username
 *
 * @param {number} length - Length of the username
 * @returns {string} Generated username
 */
export const generateUsername = (length = 16) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[crypto.randomInt(chars.length)];
  }

  return password
    .split("")
    .sort(() => crypto.randomInt(3) - 1)
    .join("");
};
