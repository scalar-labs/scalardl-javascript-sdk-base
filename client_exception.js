/**
 * Generic error thrown by the SDK.
 * @extends {Error}
 */
class ClientException extends Error {
  /**
   * @override
   * @param {StatusCode} code error status code
   * @param {string} args
   */
  constructor(code, ...args) {
    super(...args);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientException);
    }
    this.name = 'ClientException';

    /**
     * @type {StatusCode}
     */
    this.code = code;
  }

  /**
   * @return {StatusCode}
   */
  getStatusCode() {
    return this.code;
  }
}

module.exports = {
  ClientException,
};
