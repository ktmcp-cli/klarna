/**
 * Configuration management for Klarna CLI
 * @module config
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CONFIG_DIR = join(homedir(), '.klarna');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  baseUrl: process.env.KLARNA_API_URL || 'https://api.klarna.com',
  username: process.env.KLARNA_USERNAME || '',
  password: process.env.KLARNA_PASSWORD || '',
  region: process.env.KLARNA_REGION || 'eu',
  timeout: parseInt(process.env.KLARNA_TIMEOUT || '30000', 10),
  verbose: process.env.KLARNA_VERBOSE === 'true'
};

/**
 * Available API regions
 */
export const REGIONS = {
  eu: 'https://api.klarna.com',
  na: 'https://api-na.klarna.com',
  oc: 'https://api-oc.klarna.com'
};

/**
 * Load configuration from file or return defaults
 * @returns {Object} Configuration object
 */
export function loadConfig() {
  if (existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
      return { ...DEFAULT_CONFIG, ...fileConfig };
    } catch (error) {
      console.error('Error reading config file, using defaults:', error.message);
    }
  }
  return DEFAULT_CONFIG;
}

/**
 * Save configuration to file
 * @param {Object} config - Configuration to save
 */
export function saveConfig(config) {
  try {
    const dir = CONFIG_DIR;
    if (!existsSync(dir)) {
      import('fs').then(fs => fs.mkdirSync(dir, { recursive: true }));
    }
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error.message);
    return false;
  }
}

/**
 * Get configuration value
 * @param {string} key - Configuration key
 * @returns {*} Configuration value
 */
export function getConfig(key) {
  const config = loadConfig();
  return config[key];
}

/**
 * Set configuration value
 * @param {string} key - Configuration key
 * @param {*} value - Configuration value
 */
export function setConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  return saveConfig(config);
}

/**
 * Get API base URL based on region
 * @param {string} region - Region code (eu, na, oc)
 * @returns {string} Base URL
 */
export function getBaseUrl(region) {
  return REGIONS[region] || REGIONS.eu;
}

export default {
  loadConfig,
  saveConfig,
  getConfig,
  setConfig,
  getBaseUrl,
  REGIONS,
  DEFAULT_CONFIG
};
