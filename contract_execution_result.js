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
