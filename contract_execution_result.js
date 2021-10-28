const {AssetProof} = require('./asset_proof.js');

/**
 * @public
 */
class ContractExecutionResult {
  /**
   * @param {Object} result
   * @param {Array} proofs
   * @param {Array} [auditorProofs = []]
   */
  constructor(result, proofs, auditorProofs = []) {
    this.result = result;
    this.proofs = proofs;
    this.auditorProofs = auditorProofs;
  }

  /**
   * @param {proto.rpc.ContractExecutionResponse} response
   * @return {ContractExecutionResult}
   */
  static fromGrpcContractExecutionResponse(response) {
    const resultInString = response.getResult();
    const resultInObject = (resultInString) ?
      JSON.parse(resultInString) : {};

    return new ContractExecutionResult(
        resultInObject,
        response.getProofsList().map(
            (proof) => AssetProof.fromGrpcAssetProof(proof),
        ),
    );
  }

  /**
   * @return {Object}
   */
  getResult() {
    return this.result;
  }

  /**
   * @return {Array}
   */
  getProofs() {
    return this.proofs;
  }

  /**
   * @return {Array}
   */
  getAuditorProofs() {
    return this.auditorProofs;
  }
}

module.exports = {
  ContractExecutionResult,
};
