const ARGUMENT_VERSION_PREFIX = 'V';
const ARGUMENT_FORMAT_VERSION = '2';
const NONCE_SEPARATOR = '\u0001';
const FUNCTION_SEPARATOR = '\u0002';
const ARGUMENT_SEPARATOR = '\u0003';

/**
 * @param {string|Object} argument
 * @param {string} nonce
 * @param {string[]} functionIds
 * @return {string}
 */
function format(argument, nonce, functionIds) {
  if (typeof argument !== 'string' && typeof argument !== 'object') {
    throw new Error('argument must be a string or an object');
  }

  if (typeof nonce !== 'string') {
    throw new Error('nonce must be a string');
  }

  if (!Array.isArray(functionIds)) {
    throw new Error('functionIds must be an array');
  }

  return (
    ARGUMENT_VERSION_PREFIX +
    ARGUMENT_FORMAT_VERSION +
    NONCE_SEPARATOR +
    nonce +
    ARGUMENT_SEPARATOR +
    `${functionIds
        .filter((v) => typeof v === 'string')
        .join(FUNCTION_SEPARATOR)}` +
    ARGUMENT_SEPARATOR +
    `${typeof argument === 'object' ? JSON.stringify(argument) : argument}`
  );
}

module.exports = {
  format,
};
