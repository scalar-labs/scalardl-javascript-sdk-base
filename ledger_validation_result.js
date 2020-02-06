/**
 * To handle LedgerValidationResponse
 */
class LedgerValidationResult {
  /**
   * @param {StatusCode} code
   * @param {AssetProof} proof
   */
  constructor(code, proof) {
    this.code = code;
    this.proof = proof;
  }

  /**
   * @return {AssetProof}
   */
  getProof() {
    return this.proof;
  }

  /**
   * @return {StatusCode}
   */
  getCode() {
    return this.code;
  }
}

module.exports = {
  LedgerValidationResult,
};

