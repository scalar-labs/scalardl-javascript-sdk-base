/**
 * @public
 */
class AssetProof {
  /**
   * @param {string} id
   * @param {number} age
   * @param {Uint8Array} hash
   * @param {string} nonce
   * @param {Uint8Array} signature
   */
  constructor(id, age, hash, nonce, signature) {
    this.id = id;
    this.age = age;
    this.hash = hash;
    this.nonce = nonce;
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
        proof.getHash_asU8() || new Uint8Array(),
        proof.getNonce(),
        proof.getSignature_asU8() || new Uint8Array(),
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
   * @return {string}
   */
  getNonce() {
    return this.nonce;
  }

  /**
   * @return {Uint8Array}
   */
  getSignature() {
    return this.signature;
  }

  /**
   * @param {Uint8Array} hash
   * @return {Boolean}
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
   * @return {string}
   */
  toString() {
    return (
      `AssetProof{id=${this.id},` +
      `age${this.age}},` +
      `hash=${this.hash},` +
      `nonce=${this.nonce},` +
      `signature=${this.signature}}`
    );
  }
}

module.exports = {
  AssetProof,
};
