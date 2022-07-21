const {TextEncoder} = require('./polyfill/text_encoder');

/**
 * @public
 */
class AssetProof {
  /**
   * @param {string} id
   * @param {number} age
   * @param {string} nonce
   * @param {string} input
   * @param {Uint8Array} hash
   * @param {Uint8Array} prevHash
   * @param {Uint8Array} signature
   */
  constructor(id, age, nonce, input, hash, prevHash, signature) {
    this.id = id;
    this.age = age;
    this.nonce = nonce;
    this.input = input;
    this.hash = hash;
    this.prevHash = prevHash;
    this.signature = signature;
  }

  /**
   * @param {proto.rpc.AssetProof} proof
   * @return {AssetProof}
   */
  static fromGrpcAssetProof(proof) {
    return new AssetProof(
        proof.getAssetId(),
        proof.getAge(),
        proof.getNonce(),
        proof.getInput(),
        proof.getHash_asU8(),
        proof.getPrevHash_asU8(),
        proof.getSignature_asU8(),
    );
  }

  /**
   * @return {string}
   */
  getId() {
    return this.id;
  }

  /**
   * @return {number}
   */
  getAge() {
    return this.age;
  }

  /**
   * @return {Uint8Array}
   */
  getHash() {
    return this.hash;
  }

  /**
   * @return {Uint8Array}
   */
  getPrevHash() {
    return this.prevHash;
  }

  /**
   * @return {string}
   */
  getNonce() {
    return this.nonce;
  }

  /**
   * @return {string}
   */
  getInput() {
    return this.input;
  }

  /**
   * @return {Uint8Array}
   */
  getSignature() {
    return this.signature;
  }

  /**
   * @deprecated
   * @param {Uint8Array} hash
   * @return {boolean}
   */
  hashEquals(hash) {
    if (!(hash instanceof Uint8Array)) {
      return false;
    }
    if (this.hash.length !== hash.length) {
      return false;
    }
    for (let i = 0; i < this.hash.length; ++i) {
      if (this.hash[i] !== hash[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * @param {AssetProof} other
   * @return {boolean}
   */
  valueEquals(other) {
    if (!(other instanceof AssetProof)) {
      return false;
    }

    return (
      other.getId() === this.getId() &&
      other.getAge() === this.getAge() &&
      other.getNonce() === this.getNonce() &&
      other.getInput() === this.getInput() &&
      other.getHash().length === this.getHash().length &&
      other.getHash().every((e, i) => e === this.getHash()[i]) &&
      other.getPrevHash().length === this.getPrevHash().length &&
      other.getPrevHash().every((e, i) => e === this.getPrevHash()[i])
    );
  }

  /**
   * @return {string}
   */
  toString() {
    return (
      `AssetProof{id=${this.id},` +
      `age=${this.age},` +
      `hash=${this.hash},` +
      `nonce=${this.nonce},` +
      `input=${this.input},` +
      `hash=${uint8ArrayToBase64(this.hash)},` +
      `prev_hash=${uint8ArrayToBase64(this.prevHash)},` +
      `signature=${uint8ArrayToBase64(this.signature)}}`
    );
  }

  /**
   * @param {Validator} validator
   * @throws {Error}
   */
  validateWith(validator) {
    const serilized = serialize(
        this.id,
        this.age,
        this.nonce,
        this.input,
        this.hash,
        this.prevHash,
    );

    if (!validator.validate(serilized, this.signature)) {
      throw new Error(
          'The proof signature can\'t be validated with the certificate.',
      );
    }
  }
}

/**
 * @param {Uint8Array} array
 * @return {string}
 */
function uint8ArrayToBase64(array) {
  return btoa(
      Array(array.length)
          .fill('')
          .map((_, i) => String.fromCharCode(array[i]))
          .join(''),
  );
}

/**
 *
 * @param {string} id
 * @param {number} age
 * @param {string} nonce
 * @param {string} input
 * @param {Uint8Array} hash
 * @param {Uint8Array} prevHash
 * @return {Uint8Array}
 */
function serialize(id, age, nonce, input, hash, prevHash) {
  const idBytes = new TextEncoder('utf-8').encode(id);
  const view = new DataView(new ArrayBuffer(4));
  view.setUint32(0, age);
  const ageBytes = new Uint8Array(view.buffer);
  const nonceBytes = new TextEncoder('utf-8').encode(nonce);
  const inputBytes = new TextEncoder('utf-8').encode(input);

  const buffer = new Uint8Array(
      idBytes.byteLength +
      ageBytes.byteLength +
      nonceBytes.byteLength +
      inputBytes.byteLength +
      hash.byteLength +
      prevHash.byteLength,
  );

  let offset = 0;
  buffer.set(idBytes, 0);
  offset += idBytes.byteLength;
  buffer.set(ageBytes, offset);
  offset += ageBytes.byteLength;
  buffer.set(nonceBytes, offset);
  offset += nonceBytes.byteLength;
  buffer.set(inputBytes, offset);
  offset += inputBytes.byteLength;
  buffer.set(hash, offset);
  offset += hash.byteLength;
  buffer.set(prevHash, offset);

  return buffer;
}

module.exports = {
  AssetProof,
};
