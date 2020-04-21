const {StatusCode} = require('./status_code');
const {ClientError} = require('./client_error');
const {
  ClientProperties,
  ClientPropertiesField,
} = require('./client_properties');

const {
  ContractRegistrationRequestBuilder,
  ContractsListingRequestBuilder,
  LedgerValidationRequestBuilder,
  CertificateRegistrationRequestBuilder,
  FunctionRegistrationRequestBuilder,
  ContractExecutionRequestBuilder,
} = require('./request/builder');
const {ContractExecutionResult} = require('./contract_execution_result');
const {LedgerValidationResult} = require('./ledger_validation_result');
const {AssetProof} = require('./asset_proof');
const {SignerFactory} = require('./signer');

/**
 * This class handles all client interactions including registering certificates
 * and contracts, listing contracts, validating the ledger, and executing
 * contracts.
 * @class
 * @public
 */
class ClientServiceBase {
  /**
   * @param {Object} services contains the object of ledgeClient and
   *  the object of ledgerPrivileged
   * @param {Protobuf} protobuf protobuf object to inject
   * @param {Object} properties JSON Object used for setting client properties
   */
  constructor(services, protobuf, properties) {
    /** @const */
    this.properties = properties;

    /** @const */
    this.metadata = {};
    if (properties[ClientPropertiesField.AUTHORIZATION_CREDENTIAL]) {
      this.metadata.Authorization =
        properties[ClientPropertiesField.AUTHORIZATION_CREDENTIAL];
    }

    /**
     * The LedgerClient generated by gRPC library
     * @constant
     */
    this.ledgerClient = services['ledgerClient'];

    /**
     * The LedgerPrivileged generated by gRPC library
     * @constant
     */
    this.ledgerPrivileged = services['ledgerPrivileged'];

    /**
     * The protobuf message object generated by gRPC library
     * @constant
     */
    this.protobuf = protobuf;
  }

  /**
   * Name of binary status
   * @return {string}
   */
  static get binaryStatusKey() {
    return 'rpc.status-bin';
  }

  /**
   * Register user's certificate
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async registerCertificate() {
    const request = await this._createCertificateRegistrationRequest();
    const promise = new Promise((resolve, reject) => {
      this.ledgerPrivileged.registerCert(
          request,
          this.metadata,
          (err, _) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
      );
    });

    return this._executePromise(promise);
  }

  /**
   *  Create the byte array of CertificateRegistrationRequest
   * @return {Uint8Array}
   * @throws {ClientError|Error}
   */
  async createSerializedCertificateRegistrationRequest() {
    const request = await this._createCertificateRegistrationRequest();
    return request.serializeBinary();
  }

  /**
   * Register a Scalar DL function
   * @param {string} id of the function
   * @param {string} name of the function
   * @param {Uint8Array} functionBytes of the function
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async registerFunction(id, name, functionBytes) {
    const request = await this._createFunctionRegistrationRequest(
        id, name, functionBytes,
    );
    const promise = new Promise((resolve, reject) => {
      this.ledgerPrivileged.registerFunction(
          request,
          this.metadata,
          (err, _) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
      );
    });

    return this._executePromise(promise);
  };

  /**
   * Create the byte array of FunctionRegistrationRequest
   * @param {string} id of the function
   * @param {string} name of the function
   * @param {Uint8Array} functionBytes of the function
   * @return {Uint8Array}
   * @throws {ClientError|Error}
   */
  async createSerializedFunctionRegistrationRequest(id, name, functionBytes) {
    const request = await this._createFunctionRegistrationRequest(
        id, name, functionBytes,
    );
    return request.serializeBinary();
  }

  /**
   * Register a Scalar DL contract
   * @param {string} id of the contract
   * @param {string} name  the canonical name of the contract class.
   *  For example "com.banking.contract1"
   * @param {Uint8Array} contractBytes
   * @param {Object}  [properties]
   *  JSON Object used for setting client properties
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async registerContract(id, name, contractBytes, properties) {
    const request = await this._createContractRegistrationRequest(
        id, name, contractBytes, properties,
    );
    const promise = new Promise((resolve, reject) => {
      this.ledgerClient.registerContract(
          request,
          this.metadata,
          (err, _) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
      );
    });

    return this._executePromise(promise);
  }

  /**
   * Create the byte array of ContractRegistrationRequest
   * @param {string} id of the contract
   * @param {string} name  the canonical name of the contract class.
   *  For example "com.banking.contract1"
   * @param {Uint8Array} contractBytes
   * @param {Object}  [properties]
   *  JSON Object used for setting client properties
   * @return {Uint8Array}
   * @throws {ClientError|Error}
   */
  async createSerializedContractRegistrationRequest(
      id, name, contractBytes, properties,
  ) {
    const request = await this._createContractRegistrationRequest(
        id, name, contractBytes, properties,
    );
    return request.serializeBinary();
  }

  /**
   * List the registered contract for the current user
   * @param {string} [contractId]
   *  to verify if a specific contractId is registered
   * @return {Promise<Object>}
   * @throws {ClientError|Error}
   */
  async listContracts(contractId) {
    const request = await this._createContractsListingRequest(contractId);
    const promise = new Promise((resolve, reject) => {
      this.ledgerClient.listContracts(
          request,
          this.metadata,
          (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(JSON.parse(response.toObject().json));
            }
          },
      );
    });

    return this._executePromise(promise);
  }

  /**
   * Create the byte array of ContractsListingRequest
   * @param {string} contractId
   * @return {Uint8Array}
   * @throws {ClientError}
   */
  async createSerializedContractsListingRequest(contractId) {
    const request = await this._createContractsListingRequest(contractId);
    return request.serializeBinary();
  }

  /**
   * @param {string} contractId
   * @return {Promise<ContractsListingRequest>}
   * @throws {ClientError|Error}
   */
  async _createContractsListingRequest(contractId) {
    const properties = new ClientProperties(
        this.properties,
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
          ClientPropertiesField.PRIVATE_KEY_PEM,
        ],
    );

    const signerFactory = new SignerFactory(properties.getPrivateKeyPem());
    const builder = new ContractsListingRequestBuilder(
        new this.protobuf.ContractsListingRequest(),
        signerFactory.create(),
    ).withCertHolderId(properties.getCertHolderId())
        .withCertVersion(properties.getCertVersion())
        .withContractId(contractId);

    try {
      return builder.build();
    } catch (e) {
      throw new ClientError(
          StatusCode.RUNTIME_ERROR,
          e.message,
      );
    }
  }

  /**
   * Validate the integrity of an asset
   * @param {string} [assetId]
   * @return {Promise<LedgerValidationResponse>}
   * @throws {ClientError|Error}
   */
  async validateLedger(assetId) {
    const request = await this._createLedgerValidationRequest(assetId);
    const promise = new Promise((resolve, reject) => {
      this.ledgerClient.validateLedger(
          request,
          this.metadata,
          (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(
                  LedgerValidationResult.fromGrpcLedgerValidationResponse(
                      response,
                  ),
              );
            }
          },
      );
    });

    return this._executePromise(promise);
  }

  /**
   * Create the byte array of LedgerValidationRequest
   * @param {string} [assetId]
   * @return {Uint8Array}
   * @throws {ClientError|Error}
   */
  async createSerializedLedgerValidationRequest(assetId) {
    const request = await this._createLedgerValidationRequest(assetId);
    return request.serializeBinary();
  }

  /**
   * Execute a registered contract
   * @param {string} contractId
   * @param {Object} argument
   * @param {Object} [functionArgument=undefined]
   * @return {Promise<ContractExecutionResponse|void|*>}
   * @throws {ClientError|Error}
   */
  async executeContract(contractId, argument, functionArgument) {
    const request = await this._createContractExecutionRequest(
        contractId, argument, functionArgument,
    );
    const promise = new Promise((resolve, reject) => {
      this.ledgerClient.executeContract(
          request,
          this.metadata,
          (err, response) => {
            if (err) {
              reject(err);
            } else {
              resolve(ContractExecutionResult.fromGrpcContractExecutionResponse(
                  response,
              ));
            }
          },
      );
    });

    return this._executePromise(promise);
  }

  /**
   * Create the byte array of ContractExecutionRequest
   * @param {string} contractId
   * @param {Object} argument
   * @param {Object} [functionArgument=undefined]
   * @return {Uint8Array}
   * @throws {ClientError|Error}
   */
  async createSerializedContractExecutionRequest(
      contractId, argument, functionArgument,
  ) {
    const request = await this._createContractExecutionRequest(
        contractId, argument, functionArgument,
    );
    return request.serializeBinary();
  }

  /**
   * @param {Promise} promise
   * @return {Promise}
   * @throws {ClientError}
   */
  async _executePromise(promise) {
    try {
      return await promise;
    } catch (e) {
      const status = this._parseStatusFromError(e);
      if (status) {
        throw new ClientError(status.code, status.message);
      } else {
        throw new ClientError(
            StatusCode.UNKNOWN_TRANSACTION_STATUS,
            e.message,
        );
      }
    }
  }

  /**
   * Extract the status from the error
   * @param {Error} error
   * @return {Status|void} return a status or undefined if the status cannot be
   * parsed from the error
   * @private
   */
  _parseStatusFromError(error) {
    if (!error.metadata) {
      return;
    }
    let binaryStatus;
    if (this._isNodeJsRuntime()) {
      const statusMetadata = error.metadata.get(
          ClientServiceBase.binaryStatusKey);
      if (Array.isArray(statusMetadata) && statusMetadata.length === 1) {
        binaryStatus = statusMetadata[0];
      }
    } else { // Web runtime
      binaryStatus = error.metadata[ClientServiceBase.binaryStatusKey];
    }
    if (binaryStatus) {
      return this.protobuf.Status.deserializeBinary(binaryStatus).toObject();
    }
  }

  /**
   *
   * @return {boolean} true if the runtime is Node.js
   * @private
   */
  _isNodeJsRuntime() {
    return typeof window === 'undefined';
  }

  /**
   * @return {Promise<CertificateRegistrationRequest>}
   */
  async _createCertificateRegistrationRequest() {
    const properties = new ClientProperties(
        this.properties,
        [
          ClientPropertiesField.CERT_PEM,
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
        ],
    );

    const builder = new CertificateRegistrationRequestBuilder(
        new this.protobuf.CertificateRegistrationRequest(),
    ).withCertHolderId(properties.getCertHolderId())
        .withCertVersion(properties.getCertVersion())
        .withCertPem(properties.getCertPem());

    return builder.build();
  }

  /**
   * @param {string} id of the function
   * @param {string} name of the function
   * @param {Uint8Array} functionBytes of the function
   * @return {Promise<FunctionRegistrationRequest>}
   * @throws {ClientError|Error}
   */
  async _createFunctionRegistrationRequest(id, name, functionBytes) {
    if (!(functionBytes instanceof Uint8Array)) {
      throw new ClientError(
          StatusCode.CLIENT_IO_ERROR,
          'parameter functionBytes is not a \'Uint8Array\'',
      );
    }

    const builder = new FunctionRegistrationRequestBuilder(
        new this.protobuf.FunctionRegistrationRequest(),
    ).withFunctionId(id)
        .withFunctionBinaryName(name)
        .withFunctionByteCode(functionBytes);

    return builder.build();
  }

  /**
   * @param {string} id of the contract
   * @param {string} name  the canonical name of the contract class.
   *  For example "com.banking.contract1"
   * @param {Uint8Array} contractBytes
   * @param {Object}  [properties]
   *  JSON Object used for setting client properties
   * @return {Promise<ContractRegistrationRequest>}
   * @throws {ClientError|Error}
   */
  async _createContractRegistrationRequest(
      id, name, contractBytes, properties,
  ) {
    if (!(contractBytes instanceof Uint8Array)) {
      throw new ClientError(
          StatusCode.CLIENT_IO_ERROR,
          'parameter contractBytes is not a \'Uint8Array\'',
      );
    }

    const clientProperties = new ClientProperties(
        this.properties,
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
          ClientPropertiesField.PRIVATE_KEY_PEM,
        ],
    );

    const signerFactory = new SignerFactory(
        clientProperties.getPrivateKeyPem(),
    );
    const propertiesJson = JSON.stringify(properties);
    const builder = new ContractRegistrationRequestBuilder(
        new this.protobuf.ContractRegistrationRequest(),
        signerFactory.create(),
    ).withContractId(id)
        .withContractBinaryName(name)
        .withContractByteCode(contractBytes)
        .withContractProperties(propertiesJson)
        .withCertHolderId(clientProperties.getCertHolderId())
        .withCertVersion(clientProperties.getCertVersion());

    try {
      return builder.build();
    } catch (e) {
      throw new ClientError(
          StatusCode.RUNTIME_ERROR,
          e.message,
      );
    }
  }

  /**
   * @param {string} [assetId]
   * @return {Promise<LedgerValidationRequest>}
   * @throws {ClientError|Error}
   */
  async _createLedgerValidationRequest(assetId) {
    const properties = new ClientProperties(
        this.properties,
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
          ClientPropertiesField.PRIVATE_KEY_PEM,
        ],
    );

    const signerFactory = new SignerFactory(properties.getPrivateKeyPem());
    const builder = new LedgerValidationRequestBuilder(
        new this.protobuf.LedgerValidationRequest(),
        signerFactory.create(),
    ).withAssetId(assetId)
        .withCertHolderId(properties.getCertHolderId())
        .withCertVersion(properties.getCertVersion());

    try {
      return builder.build();
    } catch (e) {
      throw new ClientError(
          StatusCode.RUNTIME_ERROR,
          e.message,
      );
    }
  }

  /**
   * @param {string} contractId
   * @param {Object} argument
   * @param {Object} [functionArgument=undefined]
   * @return {Promise<ContractExecutionRequest>}
   * @throws {ClientError|Error}
   */
  async _createContractExecutionRequest(
      contractId, argument, functionArgument,
  ) {
    const properties = new ClientProperties(
        this.properties,
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
          ClientPropertiesField.PRIVATE_KEY_PEM,
        ],
    );

    const signerFactory = new SignerFactory(properties.getPrivateKeyPem());
    argument['nonce'] = new Date().getTime().toString();
    const argumentJson = JSON.stringify(argument);
    const functionArgumentJson = JSON.stringify(functionArgument);

    const builder = new ContractExecutionRequestBuilder(
        new this.protobuf.ContractExecutionRequest(),
        signerFactory.create(),
    ).withContractId(contractId)
        .withContractArgument(argumentJson)
        .withFunctionArgument(functionArgumentJson)
        .withCertHolderId(properties.getCertHolderId())
        .withCertVersion(properties.getCertVersion());

    try {
      return builder.build();
    } catch (e) {
      throw new ClientError(
          StatusCode.RUNTIME_ERROR,
          e.message,
      );
    }
  }
}

module.exports = {
  ClientServiceBase,
  ClientError,
  StatusCode,
  ContractExecutionResult,
  LedgerValidationResult,
  AssetProof,
  ClientProperties,
  ClientPropertiesField,
};
