const {AssetProof} = require('./asset_proof');

/**
 * @public
 */
class LedgerValidationResult {
  /**
   * @param {StatusCode} code
   * @param {AssetProof} proof
   * @param {AssetProof} auditorProof
   */
  constructor(code, proof, auditorProof) {
    this.code = code;
    this.proof = proof;
    this.auditorProof = auditorProof;
  }

  /**
   * @param {proto.rpc.LedgerValidationResponse} response
   * @return {LedgerValidationResult}
   */
  static fromGrpcLedgerValidationResponse(response) {
    return new LedgerValidationResult(
        response.getStatusCode(),
      response.getProof() ?
        AssetProof.fromGrpcAssetProof(response.getProof()) :
        null,
      null,
    );
  }

  /**
   * @return {AssetProof}
   */
  getProof() {
    return this.proof;
  }

  /**
   * @return {AssetProof}
   */
  getAuditorProof() {
    return this.auditorProof;
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
