const jsrsasign = require('jsrsasign');
const keyutil = require('js-crypto-key-utils');

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
    let key;

    try {
      key = await this._key(this.pkcs8);
    } catch (_) {
      throw new Error('Failed to sign the request');
    }

    try {
      const signature = await window.crypto.subtle.sign(algorithm, key, data);
      return this._P1363ToDer(new Uint8Array(signature));
    } catch (_) {
      throw new Error(`Failed to sign the request`);
    }
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
   * @param {Uint8Array} p1363
   * @return {Uint8Array}
   *
   * This function converts signature from P1363 format to ASN.1 DER format
   * IEEE P1363: bytes array of [
   *   r,
   *   s
   * ]
   *
   * ASN.1 DER: bytes array of [
   *   0x30 (DER sequence tag),
   *   (length of the bytes after this byte),
   *   0x02 (DER integer tag),
   *   (length of the bytes of r),
   *   r,
   *   0x02 (DER integer tag),
   *   (length of the bytes of s),
   *   s
   * ]
   */
  _P1363ToDer(p1363) {
    if (p1363.length != 64) {
      throw new Error('Input error');
    }
    const shouldRBePadded = (p1363[0] > 128);
    const shouldSBePadded = (p1363[32] > 128);

    // 3 bytes for DER tags, 3 bytes for length fields
    // 32 bytes for r, and 32 bytes for s
    let len = 3 + 3 + 32 + 32;
    if (shouldRBePadded) {
      len++;
    }
    if (shouldSBePadded) {
      len++;
    }
    const der = new Uint8Array(len);
    let offset = 0;

    der[offset++] = 0x30; // DER sequence tag
    der[offset++] = len - 2;
    der[offset++] = 0x02; // DER integer tag
    der[offset++] = (shouldRBePadded) ? 0x21 : 0x20;
    if (shouldRBePadded) {
      der[offset++] = 0x00;
    }
    for (let i = 0; i < 32; i++) { // r
      der[offset++] = p1363[i];
    }
    der[offset++] = 0x02; // DER integer tag
    der[offset++] = (shouldSBePadded) ? 0x21 : 0x20;
    if (shouldSBePadded) {
      der[offset++] = 0x00;
    }
    for (let i = 32; i < p1363.length; i++) { // s
      der[offset++] = p1363[i];
    }
    return der;
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
  WebCryptoSigner,
};
