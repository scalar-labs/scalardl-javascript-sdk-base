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
  ExecutionValidationRequestBuilder,
} = require('./request/builder');
const {ContractExecutionResult} = require('./contract_execution_result');
const {LedgerValidationResult} = require('./ledger_validation_result');
const {AssetProof} = require('./asset_proof');

const {v4: uuidv4} = require('uuid');
const {format} = require('./contract_execution_argument');

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
   * @param {Object} metadata gRPC metadata object used to add header
   *  to the gRPC request
   */
  constructor(services, protobuf, properties, metadata) {
    /** @const */
    this.properties = properties;

    /** The metadata object generated by gRPC library */
    this.metadata = metadata;

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
     * The AuditorClient generated by gRPC library
     * @constant
     */
    this.auditorClient = services['auditorClient'];

    /**
     * The AuditorPrivileged generated by gRPC library
     * @constant
     */
    this.auditorPrivileged = services['auditorPrivileged'];

    /**
     * The Signer class provided by Node SDK or Web SDK
     * @constant
     */
    this.signerFactory = services['signerFactory'];

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
   * Get ledger asset maximum age which is equivalent to
   * Java's Integer.MAX_VALUE equal to 2147483647
   * @return {number}
   */
  static get maxAge() {
    return 0x7fffffff;
  }

  /**
   * Get ledger asset minimum age
   * @return {number}
   */
  static get minAge() {
    return 0;
  }

  /**
   * Register user's certificate
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async registerCertificate() {
    const request = await this._createCertificateRegistrationRequest();
    return this._registerCertificate(request);
  }

  /**
   * @param {CertificateRegistrationRequest} request
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async _registerCertificate(request) {
    await this._registerToAuditorCertificate(request);

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
    return this._registerFunction(request);
  };

  /**
   * @param {FunctionRegistrationRequest} request
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async _registerFunction(request) {
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
    return this._registerContract(request);
  }

  /**
   * @param {ContractRegistrationRequest} request
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async _registerContract(request) {
    await this._registerToAuditorContract(request);

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
    return this._listContracts(request);
  }

  /**
   * @param {ContractsListingRequest} request
   * @return {Promise<void>}
   * @throws {ClientError|Error}
   */
  async _listContracts(request) {
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
        ],
        [
          ClientPropertiesField.PRIVATE_KEY_PEM,
          ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY,
        ],
    );

    const builder = new ContractsListingRequestBuilder(
        new this.protobuf.ContractsListingRequest(),
        this._createSigner(properties),
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
   * @param {number} [startAge] must be >= 0
   * @param {number} [endAge] must be <= 2147483647
   * @return {Promise<LedgerValidationResult>}
   * @throws {ClientError|Error}
   */
  async validateLedger(assetId, startAge = ClientServiceBase.minAge,
      endAge = ClientServiceBase.maxAge) {
    if (!(endAge >= startAge && startAge >= ClientServiceBase.minAge &&
          endAge <= ClientServiceBase.maxAge)) {
      throw new ClientError(
          StatusCode.CLIENT_RUNTIME_ERROR,
          'invalid ages are specified',
      );
    }

    const properties = new ClientProperties(this.properties, [], []);
    if (properties.getAuditorEnabled() &&
      properties.getAuditorLinearizableValidationEnabled
    ) {
      return this._validateLedgerWithContractExecution(
          assetId,
          startAge,
          endAge,
          properties.getAuditorLinearizableValidationContractId(),
      );
    } else {
      const request = await this._createLedgerValidationRequest(
          assetId,
          startAge,
          endAge,
      );
      return this._validateLedger(request);
    }
  }

  /**
   * @param {string} assetId
   * @param {number} startAge
   * @param {number} endAge
   * @param {string} contractId
   */
  async _validateLedgerWithContractExecution(
      assetId, startAge, endAge, contractId,
  ) {
    const argument = {
      'asset_id': assetId,
    };

    argument['start_age'] = startAge;
    argument['end_age'] = endAge;

    const result = await this.executeContract(contractId, argument);

    const ledgerProofs = result.getProofs();
    const auditorProofs = result.getAuditorProofs();

    return new LedgerValidationResult(
        StatusCode.OK,
        ledgerProofs.length > 0 ? ledgerProofs[0] : null,
        auditorProofs.length > 0 ? ledgerProofs[0] : null,
    );
  }

  /**
   * @param {LedgerValidationRequest} request
   * @return {Promise<LedgerValidationResult>}
   * @throws {ClientError|Error}
   */
  async _validateLedger(request) {
    let promises;
    const ledgerPromise = this._executePromise(
        this._validateLedgerAsync(this.ledgerClient, request),
    );
    if (this._isAuditorEnabled()) {
      const auditorPromise = this._executePromise(
          this._validateLedgerAsync(this.auditorClient, request),
      );
      promises = [ledgerPromise, auditorPromise];
    } else {
      promises = [ledgerPromise];
    }

    return Promise.all(promises).then((results) => {
      return this._validateResult(results[0], results[1]);
    }).catch((e) => {
      throw e;
    });
  }

  /**
   * Create the byte array of LedgerValidationRequest
   * @param {string} [assetId]
   * @param {number} [startAge] must be >= 0
   * @param {number} [endAge] must be <= 2147483647
   * @return {Uint8Array}
   * @throws {ClientError|Error}
   */
  async createSerializedLedgerValidationRequest(assetId,
      startAge = ClientServiceBase.minAge,
      endAge = ClientServiceBase.maxAge) {
    const request = await this._createLedgerValidationRequest(assetId, startAge,
        endAge);
    return request.serializeBinary();
  }

  /**
   * Execute a registered contract
   * @param {string} contractId
   * @param {Object|string} contractArgument
   * @param {Object|string} [functionArgument=null]
   * @param {string} [functionId=""]
   * @param {string} [nonce=null]
   * @return {Promise<ContractExecutionResult|void|*>}
   * @throws {ClientError|Error}
   */
  async executeContract(
      contractId,
      contractArgument,
      functionArgument = null,
      functionId = '',
      nonce = null,
  ) {
    if (functionArgument === null) {
      functionArgument = typeof contractArgument === 'object' ? {} : '';
    }

    if (typeof contractArgument !== typeof functionArgument) {
      throw Error(
          'contract argument and function argument must be the same type',
      );
    }

    if (nonce === null) {
      nonce = uuidv4();
    }

    const request = await this._createContractExecutionRequest(
        contractId,
        functionId,
        contractArgument,
        functionArgument,
        nonce,
    );

    return this._executeContract(request);
  }

  /**
   * @param {ContractExecutionResult} request
   * @return {Promise<ContractExecutionResult|void|*>}
   * @throws {ClientError|Error}
   */
  async _executeContract(request) {
    const ordered = await this._executeOrdering(request);
    const promise = new Promise((resolve, reject) => {
      this.ledgerClient.executeContract(
          ordered,
          this.metadata,
          async (err, response) => {
            if (err) {
              return reject(err);
            }

            if (!this._isAuditorEnabled()) {
              return resolve(
                  ContractExecutionResult.fromGrpcContractExecutionResponse(
                      response,
                  ),
              );
            }

            try {
              const auditorResponse = await this._validateExecution(
                  ordered,
                  response,
              );

              const isConsistent = this._validateResponses(
                  response,
                  auditorResponse,
              );

              if (!isConsistent) {
                return reject(
                    new ClientError(
                        StatusCode.INCONSISTENT_STATES,
                        'The results from Ledger and Auditor don\'t match',
                    ),
                );
              }

              return resolve(
                  new ContractExecutionResult(
                      response.getContractResult(),
                      response.getFunctionResult(),
                      response
                          .getProofsList()
                          .map((p) => AssetProof.fromGrpcAssetProof(p)),
                      auditorResponse
                          .getProofsList()
                          .map((p) => AssetProof.fromGrpcAssetProof(p)),
                  ),
              );
            } catch (err) {
              return reject(err);
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
        contractId,
        argument,
        functionArgument,
        '',
        uuidv4(),
    );
    return request.serializeBinary();
  }

  /**
   * @return {Boolean}
   */
  _isAuditorEnabled() {
    const properties = new ClientProperties(this.properties);
    return properties.getAuditorEnabled();
  }

  /**
   * @param {CertificateRegistrationRequest} request
   */
  async _registerToAuditorCertificate(request) {
    if (!this._isAuditorEnabled()) {
      return;
    }
    const promise = new Promise((resolve, reject) => {
      this.auditorPrivileged.registerCert(
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
   * @param {ContractRegistrationRequest} request
   */
  async _registerToAuditorContract(request) {
    if (!this._isAuditorEnabled()) {
      return;
    }
    const promise = new Promise((resolve, reject) => {
      this.auditorClient.registerContract(
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
   * @param {ContractExecutionRequest} request
   * @return {ContractExecutionRequest|Promise<ContractExecutionRequest>}
   */
  async _executeOrdering(request) {
    if (!this._isAuditorEnabled()) {
      return request;
    }
    const promise = new Promise((resolve, reject) => {
      this.auditorClient.orderExecution(
          request,
          this.metadata,
          (err, response) => {
            if (err) {
              reject(err);
            } else {
              request.setAuditorSignature(response.getSignature());
              resolve(request);
            }
          },
      );
    });
    return this._executePromise(promise);
  }

  /**
   * @param {ContractExecutionRequest} request
   * @param {ContractExecutionResponse} ledgerResponse
   * @return {Promise<ContractExecutionResponse>}
   *   the response from the execution validation from the auditor
   */
  async _validateExecution(request, ledgerResponse) {
    const promise = new Promise((resolve, reject) => {
      this.auditorClient.validateExecution(
          this._createExecutionValidationRequest(request, ledgerResponse),
          this.metadata,
          (err, auditorResponse) => {
            if (err) {
              reject(err);
            } else {
              resolve(auditorResponse);
            }
          },
      );
    });
    return this._executePromise(promise);
  }

  /**
   * @param {proto.rpc.ContractExecutionResponse} response1
   * @param {proto.rpc.ContractExecutionResponse} response2
   * @return {boolean}
   */
  _validateResponses(response1, response2) {
    const proofs1 = response1
        .getProofsList()
        .map((p) => AssetProof.fromGrpcAssetProof(p));
    const proofs2 = response2
        .getProofsList()
        .map((p) => AssetProof.fromGrpcAssetProof(p));

    if (
      response1.getContractResult() !== response2.getContractResult() ||
      proofs1.length !== proofs2.length
    ) {
      return false;
    }

    const map = new Map();
    proofs1.forEach((p) => map.set(p.getId(), p));
    proofs2.forEach((p2) => {
      const p1 = map.get(p2.getId());
      if (
        p1 === null ||
        typeof p1 === 'undefined' ||
        p1.getAge() !== p2.getAge() ||
        !p1.hashEquals(p2.getHash())
      ) {
        return false;
      }
    });
    return true;
  }

  /**
   * @param {LedgerClient|AuditorClient} client
   * @param {LedgerValidationRequest} request
   * @return {Promise}
   * @throws {ClientError}
   */
  async _validateLedgerAsync(client, request) {
    const promise = new Promise((resolve, reject) => {
      client.validateLedger(
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
    return promise;
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
      } else if (e.code === StatusCode.INCONSISTENT_STATES) {
        throw e;
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
      return this.protobuf.Status.deserializeBinary(binaryStatus)
          .toObject();
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
   * @param {Object}  [contractProperties]
   *  JSON Object used for setting contract properties
   * @return {Promise<ContractRegistrationRequest>}
   * @throws {ClientError|Error}
   */
  async _createContractRegistrationRequest(
      id, name, contractBytes, contractProperties,
  ) {
    if (!(contractBytes instanceof Uint8Array)) {
      throw new ClientError(
          StatusCode.CLIENT_IO_ERROR,
          'parameter contractBytes is not a \'Uint8Array\'',
      );
    }

    const properties = new ClientProperties(
        this.properties,
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
        ],
        [
          ClientPropertiesField.PRIVATE_KEY_PEM,
          ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY,
        ],
    );

    const contractPropertiesJson = JSON.stringify(contractProperties);
    const builder = new ContractRegistrationRequestBuilder(
        new this.protobuf.ContractRegistrationRequest(),
        this._createSigner(properties),
    ).withContractId(id)
        .withContractBinaryName(name)
        .withContractByteCode(contractBytes)
        .withContractProperties(contractPropertiesJson)
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
   * @param {string} [assetId]
   * @param {number} [startAge]
   * @param {number} [endAge]
   * @return {Promise<LedgerValidationRequest>}
   * @throws {ClientError|Error}
   */
  async _createLedgerValidationRequest(assetId, startAge, endAge) {
    const properties = new ClientProperties(
        this.properties,
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
        ],
        [
          ClientPropertiesField.PRIVATE_KEY_PEM,
          ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY,
        ],
    );

    const builder = new LedgerValidationRequestBuilder(
        new this.protobuf.LedgerValidationRequest(),
        this._createSigner(properties),
    ).withAssetId(assetId)
        .withStartAge(startAge)
        .withEndAge(endAge)
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
   * @param {string} functionId
   * @param {Object|string} contractArgument
   * @param {Object|string} functionArgument
   * @param {string} nonce
   * @return {Promise<ContractExecutionRequest>}
   * @throws {ClientError|Error}
   */
  async _createContractExecutionRequest(
      contractId,
      functionId,
      contractArgument,
      functionArgument,
      nonce,
  ) {
    const properties = new ClientProperties(
        this.properties,
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
        ],
        [
          ClientPropertiesField.PRIVATE_KEY_PEM,
          ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY,
        ],
    );

    const functionIds =
      typeof functionId === 'string' && functionId.length > 0 ?
        [functionId] :
        [];

    const builder = new ContractExecutionRequestBuilder(
        new this.protobuf.ContractExecutionRequest(),
        this._createSigner(properties),
    )
        .withContractId(contractId)
        .withContractArgument(format(nonce, functionIds, contractArgument))
        .withFunctionArgument(
        typeof functionArgument === 'object' ?
          JSON.stringify(functionArgument) :
          functionArgument,
        )
        .withCertHolderId(properties.getCertHolderId())
        .withCertVersion(properties.getCertVersion())
        .withUseFunctionIds(functionIds.length > 0)
        .withFunctionIds(functionIds)
        .withNonce(nonce);

    try {
      return builder.build();
    } catch (e) {
      throw new ClientError(StatusCode.RUNTIME_ERROR, e.message);
    }
  }

  /**
   * @param {ContractExecutionRequest} request
   * @param {ContractExecutionResponse} response
   * @return {Promise<ExecutionValidationRequest>}
   */
  _createExecutionValidationRequest(request, response) {
    const builder = new ExecutionValidationRequestBuilder(
        new this.protobuf.ExecutionValidationRequest(),
    ).withContractExecutionRequest(request)
        .withProofs(response.getProofsList());

    return builder.build();
  }

  /**
   * @param {Object} properties
   * @return {Object}
   */
  _createSigner(properties) {
    const key =
      properties.getPrivateKeyCryptoKey() || properties.getPrivateKeyPem();
    this.signer = this.signer || this.signerFactory.create(key);

    return this.signer;
  }

  /**
   * @param {LedgerValidationResult} ledgerResult
   * @param {LedgerValidationResult} auditorResult
   * @return {LedgerValidationResult}
   */
  _validateResult(ledgerResult, auditorResult) {
    if (this._isAuditorEnabled()) {
      let code = StatusCode.INCONSISTENT_STATES;
      if (ledgerResult.getCode() === StatusCode.OK &&
          auditorResult.getCode() === StatusCode.OK &&
          ledgerResult.getProof() !== null &&
          auditorResult.getProof() !== null &&
          ledgerResult.getProof().hashEquals(
              auditorResult.getProof().getHash(),
          )
      ) {
        code = StatusCode.OK;
      }
      return new LedgerValidationResult(
          code,
          ledgerResult.getProof(),
          auditorResult.getProof(),
      );
    } else {
      return ledgerResult;
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
