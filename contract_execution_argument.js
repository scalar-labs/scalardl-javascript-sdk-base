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

  return `V2\u0001${nonce}\u0003${functionIds
      .filter((v) => typeof v === 'string')
      .join('\u0002')}\u0003${
    typeof argument === 'object' ? JSON.stringify(argument) : argument
  }`;
}

/**
 * @param {Object} argument
 * @param {string} nonce
 * @return {string}
 */
function formatDeprecated(argument, nonce) {
  if (typeof argument !== 'object') {
    throw new Error('argument must be an object');
  }

  if (typeof nonce !== 'string') {
    throw new Error('nonce must be a string');
  }

  argument['nonce'] = nonce;

  return JSON.stringify(argument);
}

/**
 * @param {Object} argument
 * @return {string[]}
 */
function getFunctionIds(argument) {
  if (typeof argument !== 'object') {
    throw new Error('argument must be an object');
  }

  if (!argument.hasOwnProperty('_functions_')) {
    return [];
  }

  if (!Array.isArray(argument['_functions_'])) {
    throw new Error('argument._functions_ must be an array');
  }

  return argument['_functions_'];
}

module.exports = {
  format,
  formatDeprecated,
  getFunctionIds,
};
