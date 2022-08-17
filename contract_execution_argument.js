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

module.exports = {
  format,
};
