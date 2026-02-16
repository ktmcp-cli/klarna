/**
 * Authentication utilities for Klarna API
 * @module auth
 */

import { loadConfig } from './config.js';

/**
 * Get Basic Authentication header
 * @param {string} username - API username
 * @param {string} password - API password
 * @returns {Object} Authorization headers
 */
export function getAuthHeaders(username, password) {
  const config = loadConfig();
  const user = username || config.username;
  const pass = password || config.password;

  if (!user || !pass) {
    throw new Error(
      'Authentication credentials not found. ' +
      'Set KLARNA_USERNAME and KLARNA_PASSWORD environment variables or use --username and --password options.'
    );
  }

  const credentials = Buffer.from(`${user}:${pass}`).toString('base64');

  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Validate credentials format
 * @param {string} username - Username to validate
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export function validateCredentials(username, password) {
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return false;
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    return false;
  }
  return true;
}

/**
 * Extract credentials from options or config
 * @param {Object} options - Command options
 * @returns {Object} Credentials object
 */
export function getCredentials(options = {}) {
  const config = loadConfig();

  return {
    username: options.username || config.username,
    password: options.password || config.password
  };
}

export default {
  getAuthHeaders,
  validateCredentials,
  getCredentials
};
