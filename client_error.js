const {StatusCode} = require('./status_code');
/**
 * Generic error thrown by the SDK.
 * @extends {Error}
 */
class ClientError extends Error {
  /**
   * @override
   * @param {StatusCode} statusCode error status code
   * @param {string} args
   */
  constructor(statusCode, ...args) {
    super(...args);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientError);
    }
    this.name = 'ClientError';
    /**
     * @type {StatusCode}
     */
    this.statusCode = statusCode;
  }
}


module.exports = {
  ClientError,
};
