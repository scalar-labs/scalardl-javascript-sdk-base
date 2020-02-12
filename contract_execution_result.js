const {AssetProof} = require('./asset_proof.js');

/**
 * To handle ContractExecutionResponse
 */
class ContractExecutionResult {
  /**
   * @param {Object} result
   * @param {Array} proofs
   */
  constructor(result, proofs) {
    this.result = result;
    this.proofs = proofs;
  }

  /**
   * @param {proto.rpc.ContractExecutionResponse} response
   * @return {ContractExecutionResult}
   */
  static fromGrpcContractExecutionResponse(response) {
    const resultInString = response.getResult();
    const resultInObject = (resultInString)
      ? JSON.parse(resultInString)
      : {};

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
}

module.exports = {
  ContractExecutionResult,
};
