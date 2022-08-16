const {AssetProof} = require('./asset_proof.js');

/**
 * @public
 */
class ContractExecutionResult {
  /**
   * @param {string} contractResult
   * @param {string} functionResult
   * @param {AssetProof[]} ledgerProofs
   * @param {AssetProof[]} auditorProofs
   */
  constructor(contractResult, functionResult, ledgerProofs, auditorProofs) {
    this.contractResult = contractResult;
    this.functionResult = functionResult;
    this.ledgerProofs = ledgerProofs;
    this.auditorProofs = auditorProofs;
  }

  /**
   * @param {proto.rpc.ContractExecutionResponse} response
   * @return {ContractExecutionResult}
   */
  static fromGrpcContractExecutionResponse(response) {
    return new ContractExecutionResult(
        response.getContractResult(),
        response.getFunctionResult(),
        response
            .getProofsList()
            .map((proof) => AssetProof.fromGrpcAssetProof(proof)),
        [],
    );
  }

  /**
   * @deprecated
   * @return {Object}
   */
  getResult() {
    return this.contractResult !== '' ? JSON.parse(this.contractResult) : {};
  }

  /**
   * @return {string}
   */
  getContractResult() {
    return this.contractResult;
  }

  /**
   * @return {string}
   */
  getFunctionResult() {
    return this.functionResult;
  }

  /**
   * @deprecated
   * @return {AssetProof[]}
   */
  getProofs() {
    return this.ledgerProofs;
  }

  /**
   * @return {AssetProof[]}
   */
  getLedgerProofs() {
    return this.ledgerProofs;
  }

  /**
   * @return {AssetProof[]}
   */
  getAuditorProofs() {
    return this.auditorProofs;
  }
}

module.exports = {
  ContractExecutionResult,
};
