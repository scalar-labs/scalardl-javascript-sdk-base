const {ClientError} = require('./client_error');
const {EllipticSigner, WebCryptoSigner} = require('./signer');
const {TextEncoder} = require('./request/builder');
const {StatusCode} = require('./status_code');

class GrpcMessageGetter {
  /**
   * @param {Object} properties
   */
  constructor(properties) {
    /** @const */
    this.privateKeyPem = this._getRequiredProperty(properties,
        'scalar.dl.client.private_key_pem');
    /** @const */
    this.certPem = this._getRequiredProperty(properties,
        'scalar.dl.client.cert_pem');
    /** @const */
    this.certHolderId = this._getRequiredProperty(properties,
        'scalar.dl.client.cert_holder_id');
    /** @const */
    this.certVersion = properties['scalar.dl.client.cert_version'];

    /** @const */
    if (this._isNodeJsRuntime()) {
      this.signer = new EllipticSigner(this.privateKeyPem);
    } else {
      this.signer = new WebCryptoSigner(this.privateKeyPem);
    }
  }

  /**
   * @param {Object} properties JSON Object used for setting client properties
   * @param {string} name the name of the property to get
   * @return {Object} The client property specified in the @name parameter
   */
  _getRequiredProperty(properties, name) {
    const value = properties[name];
    if (!value) {
      throw new ClientError(
          StatusCode.CLIENT_IO_ERROR,
          `property '${name}' is required`,
      );
    }
    return value;
  }

  /**
   * @return {Uint8Array}
   */
  async getCertificateRegistrationRequest() {
    const contractCertHolderIdEncoded = new TextEncoder('utf-8').encode(
        this.certHolderId);
    const contractArgumentEncoded = new TextEncoder('utf-8').encode(
        this.certVersion);
    const contractCertPemEncoded = new TextEncoder('utf-8').encode(
        this.certPem);

    const buffer = new Uint8Array(
        contractCertHolderIdEncoded.byteLength
        + contractArgumentEncoded.byteLength
        + contractCertPemEncoded.byteLength);

    let offset = 0;
    buffer.set(contractCertHolderIdEncoded, offset);
    offset += contractCertHolderIdEncoded.byteLength;
    buffer.set(contractArgumentEncoded, offset);
    offset += contractArgumentEncoded.byteLength;
    buffer.set(contractCertPemEncoded, offset);

    return buffer
  }

  /**
   * @param {string} functionId of the function
   * @param {string} functionBinaryName of the function
   * @param {Uint8Array} functionBytes of the function
   * @return {Uint8Array}
   */
  async getFunctionRegistrationRequest(functionId, functionBinaryName,
      functionBytes) {
    if (!(functionBytes instanceof Uint8Array)) {
      throw new ClientError(
          StatusCode.CLIENT_IO_ERROR,
          'parameter functionBytes is not a \'Uint8Array\'',
      );
    }
    const functionIdEncoded = new TextEncoder('utf-8').encode(
        functionId);
    const functionBinaryNameEncoded = new TextEncoder('utf-8').encode(
        functionBinaryName);

    const buffer = new Uint8Array(
        functionIdEncoded.byteLength + functionBinaryNameEncoded.byteLength
        + functionBytes.byteLength);

    let offset = 0;
    buffer.set(functionIdEncoded, offset);
    offset += functionIdEncoded.byteLength;
    buffer.set(functionBinaryNameEncoded, offset);
    offset += functionBinaryNameEncoded.byteLength;
    buffer.set(functionBytes, offset);

    return buffer
  }

  /**
   * @param {string} contractId of the function
   * @param {string} contractBinaryName of the function
   * @param {Uint8Array} contractBytesCode of the function
   * @param {object} properties of the function
   * @return {Uint8Array}
   */
  async getContractRegistrationRequest(contractId, contractBinaryName,
      contractBytesCode, properties) {
    if (!(contractBytesCode instanceof Uint8Array)) {
      throw new ClientError(
          StatusCode.CLIENT_IO_ERROR,
          'parameter contractBytes is not a \'Uint8Array\'',
      );
    }

    const contractIdEncoded = new TextEncoder('utf-8').encode(
        contractId);
    const contractBinaryNameEncoded = new TextEncoder('utf-8').encode(
        contractBinaryName);
    const contractPropertiesEncoded = new TextEncoder('utf-8').encode(
        JSON.stringify(properties));
    const contractCertHolderIdEncoded = new TextEncoder('utf-8').encode(
        this.certHolderId);
    const contractCertVersionEncoded = new TextEncoder('utf-8').encode(
        this.certVersion);
    const buffer = new Uint8Array(
        contractIdEncoded.byteLength
        + contractBinaryNameEncoded.byteLength
        + contractBytesCode.byteLength
        + contractPropertiesEncoded.byteLength
        + contractCertHolderIdEncoded.byteLength
        + contractCertVersionEncoded.byteLength);

    let offset = 0;
    buffer.set(contractIdEncoded, offset);
    offset += contractIdEncoded.byteLength;
    buffer.set(contractBinaryNameEncoded, offset);
    offset += contractBinaryNameEncoded.byteLength;
    buffer.set(contractBytesCode, offset);
    offset += contractBytesCode.byteLength;
    buffer.set(contractPropertiesEncoded, offset);
    offset += contractPropertiesEncoded.byteLength;
    buffer.set(contractCertHolderIdEncoded, offset);
    offset += contractCertHolderIdEncoded.byteLength;
    buffer.set(contractCertVersionEncoded, offset);
    offset += contractCertVersionEncoded.byteLength;

    const signatureEncoded = new TextEncoder('utf-8').encode(
        await this.signer.sign(buffer));

    const resizedBuffer = new Uint8Array(offset + signatureEncoded.byteLength);
    resizedBuffer.set(buffer);
    resizedBuffer.set(signatureEncoded, offset);

    return resizedBuffer
  }

  /**
   * @param {string} contractId of the function
   * @return {Uint8Array}
   */
  async getContractListingRequest(contractId) {
    const contractCertHolderIdEncoded = new TextEncoder('utf-8').encode(
        this.certHolderId);
    const contractCertVersionEncoded = new TextEncoder('utf-8').encode(
        this.certVersion);
    const contractIdEncoded = new TextEncoder('utf-8').encode(
        contractId);
    const buffer = new Uint8Array(
        contractCertHolderIdEncoded.byteLength
        + contractCertVersionEncoded.byteLength
        + contractIdEncoded.byteLength);

    let offset = 0;
    buffer.set(contractCertHolderIdEncoded, offset);
    offset += contractCertHolderIdEncoded.byteLength;
    buffer.set(contractCertVersionEncoded, offset);
    offset += contractCertVersionEncoded.byteLength;
    buffer.set(contractIdEncoded, offset);
    offset += contractIdEncoded.byteLength;

    const signatureEncoded = new TextEncoder('utf-8').encode(
        await this.signer.sign(buffer));

    const resizedBuffer = new Uint8Array(offset + signatureEncoded.byteLength);
    resizedBuffer.set(buffer);
    resizedBuffer.set(signatureEncoded, offset);

    return resizedBuffer
  }

  /**
   * @param {string} contractId
   * @param {Object} contractArgument
   * @param {Object} [functionArgument=undefined]
   * @return {Uint8Array}
   */
  async getContractExecutionRequest(contractId, contractArgument,
      functionArgument) {
    const contractIdEncoded = new TextEncoder('utf-8').encode(
        contractId);
    const contractArgumentEncoded = new TextEncoder('utf-8').encode(
        JSON.stringify(contractArgument));
    const contractCertHolderIdEncoded = new TextEncoder('utf-8').encode(
        this.certHolderId);
    const contractCertVersionEncoded = new TextEncoder('utf-8').encode(
        this.certVersion);
    const functionArgumentEncoded = new TextEncoder('utf-8').encode(
        JSON.stringify(functionArgument));
    const buffer = new Uint8Array(
        contractIdEncoded.byteLength
        + contractArgumentEncoded.byteLength
        + contractCertHolderIdEncoded.byteLength
        + contractCertVersionEncoded.byteLength
        + functionArgumentEncoded.byteLength);

    let offset = 0;

    buffer.set(contractIdEncoded, offset);
    offset += contractIdEncoded.byteLength;
    buffer.set(contractArgumentEncoded, offset);
    offset += contractArgumentEncoded.byteLength;
    buffer.set(contractCertHolderIdEncoded, offset);
    offset += contractCertHolderIdEncoded.byteLength;
    buffer.set(contractCertVersionEncoded, offset);
    offset += contractCertVersionEncoded.byteLength;
    buffer.set(functionArgumentEncoded, offset);
    offset += functionArgumentEncoded.byteLength;

    const signatureEncoded = new TextEncoder('utf-8').encode(
        await this.signer.sign(buffer));

    const resizedBuffer = new Uint8Array(offset + signatureEncoded.byteLength);
    resizedBuffer.set(buffer);
    resizedBuffer.set(signatureEncoded, offset);

    return resizedBuffer
  }

  /**
   * @param {string} [assetId]
   * @return {Uint8Array}
   */
  async getLedgerValidationRequest(assetId) {
    const assetIdEncoded = new TextEncoder('utf-8').encode(
        assetId);
    const contractCertHolderIdEncoded = new TextEncoder('utf-8').encode(
        this.certHolderId);
    const contractCertVersionEncoded = new TextEncoder('utf-8').encode(
        this.certVersion);
    const buffer = new Uint8Array(
        assetIdEncoded.byteLength
        + contractCertHolderIdEncoded.byteLength
        + contractCertVersionEncoded.byteLength);

    let offset = 0;

    buffer.set(assetIdEncoded, offset);
    offset += assetIdEncoded.byteLength;
    buffer.set(contractCertHolderIdEncoded, offset);
    offset += contractCertHolderIdEncoded.byteLength;
    buffer.set(contractCertVersionEncoded, offset);
    offset += contractCertVersionEncoded.byteLength;

    const signatureEncoded = new TextEncoder('utf-8').encode(
        await this.signer.sign(buffer));

    const resizedBuffer = new Uint8Array(offset + signatureEncoded.byteLength);
    resizedBuffer.set(buffer);
    resizedBuffer.set(signatureEncoded, offset);

    return resizedBuffer
  }

  /**
   *
   * @return {boolean} true if the runtime is Node.js
   * @private
   */
  _isNodeJsRuntime() {
    return typeof window === 'undefined';
  }
}

module.exports = {
  GrpcMessageGetter,
};
