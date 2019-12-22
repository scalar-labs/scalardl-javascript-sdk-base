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

/**
 * The signer based on Web Crypto API
 */
class WebCryptoSigner {
  /**
   * @param {String} pkcs1 PKCS#1
   */
  constructor(pkcs1) {
    this.pkcs1 = pkcs1;
  }

  /**
   * @param {Uint8Array} content
   * @return {Uint8Array}
   */
  async sign(content) {
    if (!this.pkcs8) {
      this.pkcs8 = await this._PKCS1ToPKCS8(this.pkcs1);
    }

    const algorithm = { // EcdsaParams
      name: 'ECDSA',
      hash: 'SHA-256',
    };
    const data = content;
    const key = await this._key(this.pkcs8);
    const signature = await window.crypto.subtle.sign(algorithm, key, data);
    return this._P1363ToDer(new Uint8Array(signature));
  }

  /**
   * @param {String} pkcs1
   */
  async _PKCS1ToPKCS8(pkcs1) {
    pkcs1 = pkcs1.replace('-----BEGIN EC PRIVATE KEY-----', '')
        .replace('-----END EC PRIVATE KEY-----', '')
        .replace(/\n/g, '');
    const k = jsrsasign.KEYUTIL.getKey(
        jsrsasign.b64utohex(pkcs1), null, 'pkcs5prv'
    );
    const kk = new keyutil.Key('oct',
        new Uint8Array(jsrsasign.hextoArrayBuffer(k.prvKeyHex)),
        {namedCurve: 'P-256'}
    );
    return await kk.export('pem');
  }

  /**
   * @param {Uint8Array} sig
   * @return {Uint8Array}
   */
  _P1363ToDer(sig) {
    const signature = Array
        .from(sig, (x) => ('00' + x.toString(16)).slice(-2))
        .join('');
    let r = signature.substr(0, signature.length / 2);
    let s = signature.substr(signature.length / 2);
    r = r.replace(/^(00)+/, '');
    s = s.replace(/^(00)+/, '');
    if ((parseInt(r, 16) & '0x80') > 0) r = `00${r}`;
    if ((parseInt(s, 16) & '0x80') > 0) s = `00${s}`;
    const rString = `02${(r.length / 2).toString(16).padStart(2, '0')}${r}`;
    const sString = `02${(s.length / 2).toString(16).padStart(2, '0')}${s}`;
    const derSig = `30${((rString.length + sString.length) / 2)
        .toString(16).padStart(2, '0')}${rString}${sString}`;
    return new Uint8Array( derSig.match(/[\da-f]{2}/gi).map(
        (h) => parseInt(h, 16))
    );
  }

  /**
   * @param {String} pkcs8
   * @return {Object}
   */
  _key(pkcs8) {
    pkcs8 = pkcs8.replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\n/g, '');
    const keyInArrayBuffer = jsrsasign.hextoArrayBuffer(
        jsrsasign.b64utohex(pkcs8)
    );
    return window.crypto.subtle.importKey(
        'pkcs8',
        keyInArrayBuffer,
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true,
        ['sign'],
    );
  }
}

module.exports = {
  SignatureSigner: EllipticSignatureSigner, // Use elliptic library as default
  JsrsasignSignatureSigner,
  WebCryptoSigner,
};
