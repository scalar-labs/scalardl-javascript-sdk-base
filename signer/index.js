const {EllipticSigner} = require('./EllipticSigner');
const {JsrsasignSigner} = require('./JsrsasignSigner');
const {WebCryptoSigner} = require('./WebCryptoSigner');

/**
 * SignerFactory to generate signers
 */
class SignerFactory {
  /**
   * @param {String|CryptoKey} key
   */
  constructor(key) {
    this.key = key;
  }

  /**
   * @return {EllipticSigner|WebCryptoSigner}
   */
  create() {
    if (typeof window === 'undefined') { // Node environment
      return new EllipticSigner(this.key);
    } else { // Browser environment
      return new WebCryptoSigner(this.key);
    }
  }
}

module.exports = {
  EllipticSigner,
  JsrsasignSigner,
  WebCryptoSigner,
  SignerFactory,
};
