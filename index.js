const {StatusCode} = require('./status_code');
const {ClientError} = require('./client_error');
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
const {EllipticSigner, WebCryptoSigner} = require('./signer');

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
    this.serverHost = properties['scalar.dl.client.server.host'];
    /** @const */
    this.serverPort = properties['scalar.dl.client.server.port'];
    /** @const */
    this.tlsEnabled = properties['scalar.dl.client.tls.enabled'];
    if (this.tlsEnabled !== undefined && typeof this.tlsEnabled !== 'boolean') {
      throw new ClientError(
          StatusCode.CLIENT_IO_ERROR,
          'property \'scalar.dl.client.tls.enabled\' is not a boolean',
      );
    }
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
    this.credential =
      properties['scalar.dl.client.authorization.credential'];
    /** @const */
    this.certVersion = properties['scalar.dl.client.cert_version'];

    /** @const */
    this.metadata = {};
    if (this.credential) {
      this.metadata.Authorization = this.credential;
    }

    /** @const */
    if (this._isNodeJsRuntime()) {
      this.signer = new EllipticSigner(this.privateKeyPem);
    } else {
      this.signer = new WebCryptoSigner(this.privateKeyPem);
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
   * @return {Uint8Array}
   */
  async createSerializedCertificateRegistrationRequest() {
    const request = await this._createCertificateRegistrationRequest();
    return request.serializeBinary();
  }

  /**
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
   * @param {string} id of the function
   * @param {string} name of the function
   * @param {Uint8Array} functionBytes of the function
   * @return {Uint8Array}
   * @throws {ClientError}
   */
  async createSerializedFunctionRegistrationRequest(id, name, functionBytes) {
    const request = await this._createFunctionRegistrationRequest(
        id, name, functionBytes,
    );

    return request.serializeBinary();
  }

  /**
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
   * @param {string} id of the contract
   * @param {string} name  the canonical name of the contract class.
   *  For example "com.banking.contract1"
   * @param {Uint8Array} contractBytes
   * @param {Object}  [properties]
   *  JSON Object used for setting client properties
   * @return {Uint8Array}
   * @throws {ClientError}
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
   * @param {string} contractId
   * @return {Uint8Array}
   * @throws {ClientError}
   */
  async createSerializedContractsListingRequest(contractId) {
    const request = await this.__createContractsListingRequest(contractId);
    return request.serializeBinary();
  }

  /**
   * @param {string} contractId
   * @return {Promise<ContractsListingRequest>}
   * @throws {ClientError}
   */
  async _createContractsListingRequest(contractId) {
    const builder = new ContractsListingRequestBuilder(
        new this.protobuf.ContractsListingRequest(),
        this.signer,
    ).withCertHolderId(this.certHolderId)
        .withCertVersion(this.certVersion)
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
   * @param {number} [assetId]
   * @return {Uint8Array}
   * @throws {ClientError}
   */
  async createSerializedLedgerValidationRequest(assetId) {
    const request = await this._createLedgerValidationRequest(assetId);
    return request.serializeBinary();
  }

  /**
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
   * @param {number} contractId
   * @param {Object} argument
   * @param {Object} [functionArgument=undefined]
   * @return {Uint8Array}
   * @throws {ClientError}
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
    const builder = new CertificateRegistrationRequestBuilder(
        new this.protobuf.CertificateRegistrationRequest(),
    ).withCertHolderId(this.certHolderId)
        .withCertVersion(this.certVersion)
        .withCertPem(this.certPem);

    return builder.build();
  }

  /**
   * @param {string} id of the function
   * @param {string} name of the function
   * @param {Uint8Array} functionBytes of the function
   * @return {Promise<FunctionRegistrationRequest>}
   * @throws {ClientError}
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
   * @throws {ClientError}
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

    const propertiesJson = JSON.stringify(properties);
    const builder = new ContractRegistrationRequestBuilder(
        new this.protobuf.ContractRegistrationRequest(),
        this.signer,
    ).withContractId(id)
        .withContractBinaryName(name)
        .withContractByteCode(contractBytes)
        .withContractProperties(propertiesJson)
        .withCertHolderId(this.certHolderId)
        .withCertVersion(this.certVersion);

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
   * @param {number} [assetId]
   * @return {Promise<LedgerValidationRequest>}
   * @throws {ClientError}
   */
  async _createLedgerValidationRequest(assetId) {
    const builder = new LedgerValidationRequestBuilder(
        new this.protobuf.LedgerValidationRequest(),
        this.signer,
    ).withAssetId(assetId)
        .withCertHolderId(this.certHolderId)
        .withCertVersion(this.certVersion);

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
   * @param {number} contractId
   * @param {Object} argument
   * @param {Object} [functionArgument=undefined]
   * @return {Promise<ContractExecutionRequest>}
   * @throws {ClientError}
   */
  async _createContractExecutionRequest(
      contractId, argument, functionArgument,
  ) {
    argument['nonce'] = new Date().getTime().toString();
    const argumentJson = JSON.stringify(argument);
    const functionArgumentJson = JSON.stringify(functionArgument);

    const builder = new ContractExecutionRequestBuilder(
        new this.protobuf.ContractExecutionRequest(),
        this.signer,
    ).withContractId(contractId)
        .withContractArgument(argumentJson)
        .withFunctionArgument(functionArgumentJson)
        .withCertHolderId(this.certHolderId)
        .withCertVersion(this.certVersion);

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
};
