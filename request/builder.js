const jsrsasign = require('jsrsasign');

/**
 * An internal class to encode utf8 string to Uint8Array
 * @class
 */
class TextEncoder {
  /**
   * To encode utf8 to Uint8Array
   * @param {string} string
   * @return {Uint8Array}
   */
  encode(string) {
    return !string
        ? new Uint8Array()
        : new Uint8Array(
            jsrsasign.hextoArrayBuffer(jsrsasign.utf8tohex(string)));
  }
}

/**
 * An internal class to validate input
 * @class
 */
class Validator {
  /**
   * @param {*} input
   * @param {Object} type
   */
  validateInput(input, type) {
    if (input.constructor !== type || (input.constructor === Number && input < 0)) {
      throw new Error('Illegal argument')
    }
  }
}

/**
 * Used to build a CertificateRegistrationRequest.
 */
class CertificateRegistrationRequestBuilder {
  /**
   * @constructor
   * @param {CertificateRegistrationRequest} request
   */
  constructor(request) {
    this.request = request;
  }

  /**
   * Sets the ID of the certificate holder
   * @param {string} id
   * @return {CertificateRegistrationRequestBuilder}
   */
  withCertHolderId(id) {
    /** @const */
    this.certHolderId = id;
    return this;
  }

  /**
   * Sets the certificate version
   * @param {number} version
   * @return {CertificateRegistrationRequestBuilder}
   */
  withCertVersion(version) {
    /** @const */
    this.certVersion = version;
    return this;
  }

  /**
   * Sets the .pem of the certificate
   * @param {string} pem
   * @return {CertificateRegistrationRequestBuilder}
   */
  withCertPem(pem) {
    /** @const */
    this.certPem = pem;
    return this;
  }

  /**
   * Builds the CertificateRegistrationRequest
   * @return {CertificateRegistrationRequest}
   * @throws {Error}
   */
  async build() {
    const validator = new Validator();
    validator.validateInput(this.certHolderId, String);
    validator.validateInput(this.certVersion, Number);
    validator.validateInput(this.certPem, String);


    const request = this.request;
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);
    request.setCertPem(this.certPem);
    return request;
  }
}

/**
 * Used to build a FunctionRegistrationRequest.
 */
class FunctionRegistrationRequestBuilder {
  /**
   * @constructor
   * @param {FunctionRegistrationRequest} request
   */
  constructor(request) {
    this.request = request;
  }

  /**
   * Sets the ID of the function
   * @param {string} id
   * @return {FunctionRegistrationRequestBuilder}
   */
  withFunctionId(id) {
    /** @const */
    this.functionId = id;
    return this;
  }

  /**
   * Sets the certificate version
   * @param {string} name
   * @return {FunctionRegistrationRequestBuilder}
   */
  withFunctionBinaryName(name) {
    /** @const */
    this.functionBinaryName = name;
    return this;
  }

  /**
   * Sets the function byteCode
   * @param {Uint8Array} functionBytes
   * @return {FunctionRegistrationRequestBuilder}
   */
  withFunctionByteCode(functionBytes) {
    /** @const */
    this.functionByteCode = functionBytes;
    return this;
  }

  /**
   * Builds the FunctionRegistrationRequest
   * @return {FunctionRegistrationRequest}
   * @throws {Error}
   */
  async build() {
    const validator = new Validator();
    validator.validateInput(this.functionId, String);
    validator.validateInput(this.functionBinaryName, String);
    validator.validateInput(this.functionByteCode, Uint8Array);

    const request = this.request;
    request.setFunctionId(this.functionId);
    request.setFunctionBinaryName(this.functionBinaryName);
    request.setFunctionByteCode(this.functionByteCode);
    return request;
  }
}

/**
 * Used for building a ContractRegistrationRequest
 */
class ContractRegistrationRequestBuilder {
  /**
   * @constructs
   * @param {ContractRegistrationRequest} request
   * @param {SignatureSigner} signer
   */
  constructor(request, signer) {
    this.request = request;
    this.signer = signer;
  }

  /**
   * Sets the contract ID
   * @param {string} id
   * @return {ContractRegistrationRequestBuilder}
   */
  withContractId(id) {
    /** @const */
    this.contractId = id;
    return this;
  }

  /**
   * Sets the binary file name of the contract
   * @param {string} binaryName
   * @return {ContractRegistrationRequestBuilder}
   */
  withContractBinaryName(binaryName) {
    /** @const */
    this.contractBinaryName = binaryName;
    return this;
  }

  /**
   * Sets the byte code of the contract
   * @param {Uint8Array} contractBytes
   * @return {ContractRegistrationRequestBuilder}
   */
  withContractByteCode(contractBytes) {
    /** @const */
    this.contractByteCode = contractBytes;
    return this;
  }

  /**
   * Sets the contract's properties
   * @param {string} properties
   * @return {ContractRegistrationRequestBuilder}
   */
  withContractProperties(properties) {
    /** @const */
    this.contractProperties = properties;
    return this;
  }

  /**
   * Sets the ID of the certificate holder
   * @param {string} id
   * @return {ContractRegistrationRequestBuilder}
   */
  withCertHolderId(id) {
    /** @const */
    this.certHolderId = id;
    return this;
  }

  /**
   * Sets the certificate's version
   * @param {number} version
   * @return {ContractRegistrationRequestBuilder}
   */
  withCertVersion(version) {
    /** @const */
    this.certVersion = version;
    return this;
  }

  /**
   * Builds the ContractRegistrationRequest
   * @throws {Error}
   * @return {ContractRegistrationRequest}
   */
  async build() {
    const validator = new Validator();
    validator.validateInput(this.contractId, String);
    validator.validateInput(this.contractBinaryName, String);
    validator.validateInput(this.contractByteCode, Uint8Array);
    validator.validateInput(this.contractProperties, String);
    validator.validateInput(this.certHolderId, String);
    validator.validateInput(this.certVersion, Number);

    const request = this.request;
    request.setContractId(this.contractId);
    request.setContractBinaryName(this.contractBinaryName);
    request.setContractByteCode(this.contractByteCode);
    request.setContractProperties(this.contractProperties);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);

    const contractId = new TextEncoder('utf-8').encode(this.contractId);
    const contractBinaryName = new TextEncoder('utf-8').encode(
        this.contractBinaryName);
    const contractBytes = this.contractByteCode;
    const contractProperties = new TextEncoder('utf-8').encode(
        this.contractProperties);
    const certHolderId = new TextEncoder('utf-8').encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);

    const buffer = new Uint8Array(
        contractId.byteLength + contractBinaryName.byteLength +
        contractBytes.byteLength + contractProperties.byteLength +
        certHolderId.byteLength + certVersion.byteLength);

    let offset = 0;
    buffer.set(contractId, offset);
    offset += contractId.byteLength;
    buffer.set(contractBinaryName, offset);
    offset += contractBinaryName.byteLength;
    buffer.set(contractBytes, offset);
    offset += contractBytes.byteLength;
    buffer.set(contractProperties, offset);
    offset += contractProperties.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}

/**
 * Used for building a ContractsListingRequest
 */
class ContractsListingRequestBuilder {
  /**
   * @constructs
   * @param {ContractsListingRequest} request
   * @param {SignatureSigner} signer
   */
  constructor(request, signer) {
    this.request = request;
    this.signer = signer;
  }

  /**
   * Sets the ID of the certificate holder
   * @param {string} id
   * @return {ContractsListingRequestBuilder}
   */
  withCertHolderId(id) {
    /** @const */
    this.certHolderId = id;
    return this;
  }

  /**
   * Sets the certificate's version
   * @param {number} version
   * @return {ContractsListingRequestBuilder}
   */
  withCertVersion(version) {
    /** @const */
    this.certVersion = version;
    return this;
  }

  /**
   * Sets the contract ID
   * @param {string} id
   * @return {ContractsListingRequestBuilder}
   */
  withContractId(id) {
    /** @const */
    this.contractId = id;
    return this;
  }

  /**
   * Builds the ContractsListingRequest
   * @throws {Error}
   * @return {ContractsListingRequest}
   */
  async build() {
    const validator = new Validator();
    validator.validateInput(this.certHolderId, String);
    validator.validateInput(this.certVersion, Number);
    validator.validateInput(this.contractId, String);

    const request = this.request;
    request.setContractId(this.contractId);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);

    const contractIdEncoded = new TextEncoder('utf-8').encode(this.contractId);
    const certHolderId = new TextEncoder('utf-8').encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);

    const buffer = new Uint8Array(
      contractIdEncoded.byteLength + certHolderId.byteLength + certVersion.byteLength);
    let offset = 0;

    buffer.set(contractIdEncoded, offset);
    offset += contractIdEncoded.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}

/**
 * Used for building a LedgerValidationRequest
 */
class LedgerValidationRequestBuilder {
  /**
   * @constructs
   * @param {LedgerValidationRequest} request
   * @param {SignatureSigner} signer
   */
  constructor(request, signer) {
    this.request = request;
    this.signer = signer;
  }

  /**
   * Sets the asset ID
   * @param {string} id
   * @return {LedgerValidationRequestBuilder}
   */
  withAssetId(id) {
    /** @const */
    this.assetId = id;
    return this;
  }

  /**
   * Sets the ID of the certificate holder
   * @param {string} id
   * @return {LedgerValidationRequestBuilder}
   */
  withCertHolderId(id) {
    /** @const */
    this.certHolderId = id;
    return this;
  }

  /**
   * Sets the certificate's version
   * @param {number} version
   * @return {LedgerValidationRequestBuilder}
   */
  withCertVersion(version) {
    /** @const */
    this.certVersion = version;
    return this;
  }

  /**
   * Builds a LedgerValidationRequest
   * @throws {Error}
   * @return {LedgerValidationRequest}
   */
  async build() {
    const validator = new Validator();
    validator.validateInput(this.assetId, String);
    validator.validateInput(this.certHolderId, String);
    validator.validateInput(this.certVersion, Number);

    const request = this.request;
    request.setAssetId(this.assetId);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);

    const assetId_ = new TextEncoder('utf-8').encode(this.assetId);
    const certHolderId = new TextEncoder('utf-8').encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);

    const buffer = new Uint8Array(
        assetId_.byteLength + certHolderId.byteLength + certVersion.byteLength);
    let offset = 0;
    buffer.set(assetId_, offset);
    offset += assetId_.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}

/**
 * Used for building a ContractExecutionRequest
 */
class ContractExecutionRequestBuilder {
  /**
   * @constructs
   * @param {ContractExecutionRequest} request
   * @param {SignatureSigner} signer
   */
  constructor(request, signer) {
    this.request = request;
    this.signer = signer;
  }

  /**
   * Sets the contract ID
   * @param {string} id
   * @return {ContractExecutionRequestBuilder}
   */
  withContractId(id) {
    /** @const */
    this.contractId = id;
    return this;
  }

  /**
   * Sets the contract argument
   * @param {string} argument
   * @return {ContractExecutionRequestBuilder}
   */
  withContractArgument(argument) {
    /** @const */
    this.contractArgument = argument;
    return this;
  }

  /**
   * Sets the ID of the certificate holder
   * @param {string} id
   * @return {ContractExecutionRequestBuilder}
   */
  withCertHolderId(id) {
    /** @const */
    this.certHolderId = id;
    return this;
  }

  /**
   * Sets the certificate's version
   * @param {number} version
   * @return {ContractExecutionRequestBuilder}
   */
  withCertVersion(version) {
    /** @const */
    this.certVersion = version;
    return this;
  }

  /**
   * Sets the function argument
   * @param {string} argument
   * @return {ContractExecutionRequestBuilder}
   */
  withFunctionArgument(argument) {
    this.functionArgument = argument;
    return this;
  }

  /**
   * Builds the ContractExecutionRequest
   * @throws {Error}
   * @return {ContractExecutionRequest}
   */
  async build() {
    const validator = new Validator();
    validator.validateInput(this.contractId, String);
    validator.validateInput(this.contractArgument, String);
    validator.validateInput(this.certHolderId, String);
    validator.validateInput(this.certVersion, Number);
    validator.validateInput(this.functionArgument, String);

    const request = this.request;
    request.setContractId(this.contractId);
    request.setContractArgument(this.contractArgument);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);

    const contractId = new TextEncoder('utf-8').encode(this.contractId);
    const contractArgument = new TextEncoder('utf-8').encode(
        this.contractArgument);
    const certHolderId = new TextEncoder('utf-8').encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);
    const buffer = new Uint8Array(
        contractId.byteLength + contractArgument.byteLength +
        certHolderId.byteLength + certVersion.byteLength);
    let offset = 0;

    buffer.set(contractId, offset);
    offset += contractId.byteLength;
    buffer.set(contractArgument, offset);
    offset += contractArgument.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}

module.exports = {
  CertificateRegistrationRequestBuilder,
  FunctionRegistrationRequestBuilder,
  ContractRegistrationRequestBuilder,
  ContractsListingRequestBuilder,
  LedgerValidationRequestBuilder,
  ContractExecutionRequestBuilder,
};
