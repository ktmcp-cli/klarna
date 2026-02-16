/**
 * Klarna Payments API client
 * @module api
 */

import axios from 'axios';
import { loadConfig, getBaseUrl } from './config.js';
import { getAuthHeaders } from './auth.js';

/**
 * Create axios instance with default configuration
 * @param {Object} options - Request options
 * @returns {Object} Axios instance
 */
function createClient(options = {}) {
  const config = loadConfig();
  const baseURL = options.region ? getBaseUrl(options.region) : config.baseUrl;

  return axios.create({
    baseURL,
    timeout: options.timeout || config.timeout,
    headers: {
      ...getAuthHeaders(options.username, options.password),
      'User-Agent': '@ktmcp-cli/klarna/1.0.0'
    }
  });
}

/**
 * Handle API errors
 * @param {Error} error - Axios error
 * @returns {Object} Formatted error
 */
function handleError(error) {
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      status: error.response.status,
      statusText: error.response.statusText,
      message: error.response.data?.error_message || error.response.data?.message || 'API request failed',
      data: error.response.data,
      headers: error.response.headers
    };
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      status: 0,
      message: 'No response from server',
      error: error.message
    };
  } else {
    // Error setting up request
    return {
      success: false,
      status: 0,
      message: error.message,
      error: error.message
    };
  }
}

/**
 * Create a new payment session
 * @param {Object} sessionData - Session data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function createSession(sessionData, options = {}) {
  try {
    const client = createClient(options);
    const response = await client.post('/payments/v1/sessions', sessionData);

    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Get session details
 * @param {string} sessionId - Session ID
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function getSession(sessionId, options = {}) {
  try {
    const client = createClient(options);
    const response = await client.get(`/payments/v1/sessions/${sessionId}`);

    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Update an existing session
 * @param {string} sessionId - Session ID
 * @param {Object} sessionData - Updated session data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function updateSession(sessionId, sessionData, options = {}) {
  try {
    const client = createClient(options);
    const response = await client.post(`/payments/v1/sessions/${sessionId}`, sessionData);

    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Create an order from authorization
 * @param {string} authorizationToken - Authorization token
 * @param {Object} orderData - Order data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function createOrder(authorizationToken, orderData, options = {}) {
  try {
    const client = createClient(options);
    const response = await client.post(
      `/payments/v1/authorizations/${authorizationToken}/order`,
      orderData
    );

    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Cancel an authorization
 * @param {string} authorizationToken - Authorization token
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function cancelAuthorization(authorizationToken, options = {}) {
  try {
    const client = createClient(options);
    const response = await client.delete(`/payments/v1/authorizations/${authorizationToken}`);

    return {
      success: true,
      status: response.status,
      message: 'Authorization cancelled successfully'
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Generate customer token
 * @param {string} authorizationToken - Authorization token
 * @param {Object} tokenData - Token generation data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function generateCustomerToken(authorizationToken, tokenData, options = {}) {
  try {
    const client = createClient(options);
    const response = await client.post(
      `/payments/v1/authorizations/${authorizationToken}/customer-token`,
      tokenData
    );

    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Make a custom API request
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request data
 * @param {Object} options - Request options
 * @returns {Promise<Object>} API response
 */
export async function customRequest(method, path, data = null, options = {}) {
  try {
    const client = createClient(options);
    const config = {
      method: method.toUpperCase(),
      url: path
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      config.data = data;
    }

    const response = await client.request(config);

    return {
      success: true,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return handleError(error);
  }
}

export default {
  createSession,
  getSession,
  updateSession,
  createOrder,
  cancelAuthorization,
  generateCustomerToken,
  customRequest
};
