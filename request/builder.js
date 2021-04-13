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
   * @param {Boolean} optional, true if input is nullable
   */
  validateInput(input, type, optional) {
    if (optional && (input === null || typeof input === 'undefined')) {
      return;
    }

    if (type.name === 'Uint8Array' && (input instanceof Uint8Array)) {
      return;
    }

    if (typeof input === 'undefined'
        || input === null
        || input.constructor !== type
        || (input.constructor === Number && input < 0)
    ) {
      throw new Error('Specified argument is illegal.');
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
   * @param {string} functionBytes
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
    validator.validateInput(this.contractProperties, String, true);
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
    validator.validateInput(this.contractId, String, true);

    const request = this.request;
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);
    request.setContractId(this.contractId);

    const certHolderId = new TextEncoder('utf-8').encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);
    const contractIdEncoded = new TextEncoder('utf-8').encode(this.contractId);

    const buffer = new Uint8Array(
        contractIdEncoded.byteLength + certHolderId.byteLength +
        certVersion.byteLength);
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
   * Sets the startAge
   * @param {number} startAge
   * @return {LedgerValidationRequestBuilder}
   */
  withStartAge(startAge) {
    this.startAge = startAge;
    return this;
  }

  /**
   * Sets the endAge
   * @param {number} endAge
   * @return {LedgerValidationRequestBuilder}
   */
  withEndAge(endAge) {
    this.endAge = endAge;
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
    validator.validateInput(this.startAge, Number);
    validator.validateInput(this.endAge, Number);
    validator.validateInput(this.certHolderId, String);
    validator.validateInput(this.certVersion, Number);

    const request = this.request;
    request.setAssetId(this.assetId);
    request.setStartAge(this.startAge);
    request.setEndAge(this.endAge);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);

    const assetId_ = new TextEncoder('utf-8').encode(this.assetId);
    const viewStartAge = new DataView(new ArrayBuffer(4));
    const viewEndAge = new DataView(new ArrayBuffer(4));
    const viewCertVersion = new DataView(new ArrayBuffer(4));
    viewStartAge.setUint32(0, this.startAge)
    const startAge = new Uint8Array(viewStartAge.buffer)
    viewEndAge.setUint32(0, this.endAge)
    const endAge = new Uint8Array(viewEndAge.buffer)
    const certHolderId = new TextEncoder('utf-8').encode(this.certHolderId);
    viewCertVersion.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(viewCertVersion.buffer);

    const buffer = new Uint8Array(
        assetId_.byteLength +
        startAge.byteLength +
        endAge.byteLength +
        certHolderId.byteLength +
        certVersion.byteLength);
    let offset = 0;
    buffer.set(assetId_, offset);
    offset += assetId_.byteLength;
    buffer.set(startAge, offset)
    offset += startAge.byteLength;
    buffer.set(endAge, offset)
    offset += endAge.byteLength;
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
    validator.validateInput(this.functionArgument, String, true);

    const request = this.request;
    request.setContractId(this.contractId);
    request.setContractArgument(this.contractArgument);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);
    request.setFunctionArgument(this.functionArgument);

    const contractIdEncoded = new TextEncoder('utf-8').encode(this.contractId);
    const contractArgument = new TextEncoder('utf-8').encode(
        this.contractArgument);
    const certHolderId = new TextEncoder('utf-8').encode(this.certHolderId);
    const view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, this.certVersion);
    const certVersion = new Uint8Array(view.buffer);

    const buffer = new Uint8Array(
        contractIdEncoded.byteLength + contractArgument.byteLength +
        certHolderId.byteLength + certVersion.byteLength);
    let offset = 0;
    buffer.set(contractIdEncoded, offset);
    offset += contractIdEncoded.byteLength;
    buffer.set(contractArgument, offset);
    offset += contractArgument.byteLength;
    buffer.set(certHolderId, offset);
    offset += certHolderId.byteLength;
    buffer.set(certVersion, offset);

    request.setSignature(await this.signer.sign(buffer));

    return request;
  }
}

/**
 * Used for building a RequestProofRegistrationRequest
 */
class RequestProofRegistrationRequestBuilder {
  /**
   * @constructs
   * @param {RequestProofRegistrationRequest} request
   */
  constructor(request) {
    this.request = request;
  }

  /**
   * Sets the contract ID
   * @param {string} id
   * @return {RequestProofRegistrationRequestBuilder}
   */
  withContractId(id) {
    /** @const */
    this.contractId = id;
    return this;
  }

  /**
   * Sets the contract argument
   * @param {string} argument
   * @return {RequestProofRegistrationRequestBuilder}
   */
  withContractArgument(argument) {
    /** @const */
    this.contractArgument = argument;
    return this;
  }

  /**
   * Sets the ID of the certificate holder
   * @param {string} id
   * @return {RequestProofRegistrationRequestBuilder}
   */
  withCertHolderId(id) {
    /** @const */
    this.certHolderId = id;
    return this;
  }

  /**
   * Sets the certificate's version
   * @param {number} version
   * @return {RequestProofRegistrationRequestBuilder}
   */
  withCertVersion(version) {
    /** @const */
    this.certVersion = version;
    return this;
  }

  /**
   * Sets the signature
   * @param {Uint8Array} signature
   * @return {RequestProofRegistrationRequestBuilder}
   */
  withSignature(signature) {
    /** @const */
    this.signature = signature;
    return this;
  }

  /**
   * Builds the RequestProofRegistrationRequest
   * @throws {Error}
   * @return {RequestProofRegistrationRequest}
   */
  build() {
    const request = this.request;
    request.setContractId(this.contractId);
    request.setContractArgument(this.contractArgument);
    request.setCertHolderId(this.certHolderId);
    request.setCertVersion(this.certVersion);
    request.setSignature(this.signature);
    return request;
  }
}

/**
 * Used for building a ContractExecutionRequestWithAssetProofs
 */
class ContractExecutionRequestWithAssetProofsBuilder {
  /**
   * @constructs
   * @param {ContractExecutionRequestWithAssetProof} request
   */
  constructor(request) {
    this.request = request;
  }

  /**
   * Sets the asset proofs
   * @param {Array} proofs
   * @return {ContractExecutionRequestWithAssetProofsBuilder}
   */
  withProofs(proofs) {
    /** @const */
    this.proofs = proofs;
    return this;
  }

  /**
   * Builds the ContractExecutionRequestWithAssetProofs
   * @throws {Error}
   * @return {ContractExecutionRequestWithAssetProofs}
   */
  build() {
    const request = this.request;
    request.setProofsList(this.proofs);
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
  RequestProofRegistrationRequestBuilder,
  ContractExecutionRequestWithAssetProofsBuilder,
};
