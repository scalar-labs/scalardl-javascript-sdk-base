const crypto = require('crypto');
const elliptic = require('elliptic');
const jsrsasign = require('jsrsasign');

/**
 * This class is a base class for signing certificates
 */
class SignatureSigner {
  /**
   * @param {string} pem
   */
  constructor(pem) {
    this.pem = pem;
  }

  /**
   * This method must be implemented for all signer class
   * @param {Uint8Array} content
   */
  sign(content) {
    throw new Error(`sign is not implemented`);
  }

  /**
   * This method must be implemented for all signer class
   * @return {string}
   */
  getBase64PemString() {
    return this.pem.replace('-----BEGIN EC PRIVATE KEY-----', '').
        replace('-----END EC PRIVATE KEY-----', '').
        replace(/\n/g, '');
  }
}

/**
 * This class is used for signing certificates using jsrsasign library
 */
class JsrsasignSignatureSigner extends SignatureSigner {
  /**
   * @param {string} pem
   */
  constructor(pem) {
    super(pem);
  }

  /**
   * This method is used for signing the content
   * @param {Uint8Array} content
   * @return {Uint8Array}
   */
  sign(content) {
    const hex = jsrsasign.ArrayBuffertohex(content.buffer);
    const ecdsa = new jsrsasign.KJUR.crypto.ECDSA();
    try {
      const base64 = this.getBase64PemString();
      ecdsa.readPKCS5PrvKeyHex(jsrsasign.b64utohex(base64));
    } catch (err) {
      throw new Error(`Failed to load private key ${err}`);
    }

    try {
      const signature = new jsrsasign.KJUR.crypto.Signature({
        'alg': 'SHA256withECDSA',
      });
      signature.init(ecdsa);
      signature.updateHex(hex);

      return new Uint8Array(jsrsasign.hextoArrayBuffer(signature.sign()));
    } catch (err) {
      throw new Error(`Failed to sign the request ${err}`);
    }
  }
}

/**
 * This class is used for signing certificates using elliptic library
 */
class EllipticSignatureSigner extends SignatureSigner {
  /**
   * @param {string} pem
   */
  constructor(pem) {
    super(pem);
  }

  /**
   * This method is used for signing the content
   * @param {Uint8Array} content
   * @return {Uint8Array}
   */
  sign(content) {
    try {
      const base64 = this.getBase64PemString();
      const {prvKeyHex} = jsrsasign.KEYUTIL.getKey(
          jsrsasign.b64utohex(base64), null, 'pkcs5prv');
      const EC = elliptic.ec;
      const ecdsaCurve = elliptic.curves['p256'];
      const ecdsa = new EC(ecdsaCurve);
      const signKey = ecdsa.keyFromPrivate(prvKeyHex, 'hex');
      const sha256 = crypto.createHash('sha256');
      const digest = sha256.update(content).digest();
      const signature = ecdsa.sign(Buffer.from(digest, 'hex'), signKey);
      return new Uint8Array(signature.toDER());
    } catch (err) {
      throw new Error(`Failed to sign the request ${err}`);
    }
  }
}

module.exports = {
  SignatureSigner: EllipticSignatureSigner, // Use elliptic library as default
  JsrsasignSignatureSigner,
};
