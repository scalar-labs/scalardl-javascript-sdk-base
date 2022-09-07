const jsrsasign = require('jsrsasign');

/**
 * An internal class to encode utf8 string to Uint8Array
 * @class
 */
class TextEncoder {
  /**
   * To encode utf8 to Uint8Array
   * @param {string} string
   * @return {Uint8Array}
   */
  encode(string) {
    return !string ?
      new Uint8Array() :
      new Uint8Array(jsrsasign.hextoArrayBuffer(jsrsasign.utf8tohex(string)));
  }
}

module.exports = {
  TextEncoder,
};
