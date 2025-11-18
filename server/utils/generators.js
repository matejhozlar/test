import crypto from "node:crypto";

/**
 * Generate a secure random password or username
 *
 * @param {number} length - Length of the password or username (default 16)
 * @returns {string} Generated password or username
 */
export const generateString = (length = 16) => {
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
