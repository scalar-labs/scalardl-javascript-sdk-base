const {
  ClientServiceBase,
  StatusCode,
  ClientError,
  ContractExecutionResult,
  LedgerValidationResult,
} = require('..');

const sinon = require('sinon');
const assert = require('chai').assert;
const protobuf = {};
const services = {
  'ledgerPrivileged': {},
  'ledgerClient': {},
};
const clientProperties = {
  'scalar.dl.client.private_key_pem': 'key',
  'scalar.dl.client.cert_pem': 'cert',
  'scalar.dl.client.cert_holder_id': 'hold',
  'scalar.dl.client.cert_version': 1,
};

describe('Class ClientServiceBase', () => {
  describe('The constructor', () => {
    it('should properly load the attribute according to the given property',
        () => {
        // prepare
          const clientProperties = {
            'scalar.dl.client.private_key_pem': 'key',
            'scalar.dl.client.cert_pem': 'cert',
            'scalar.dl.client.cert_holder_id': 'hold',
            'scalar.dl.client.cert_version': '1.0',
            'scalar.dl.client.authorization.credential':
            'mocked-credentials',
          };

          // act
          const clientService = new ClientServiceBase(services,
              protobuf, clientProperties);

          // assert
          assert.equal(clientService.privateKeyPem, 'key');
          assert.equal(clientService.certPem, 'cert');
          assert.equal(clientService.certHolderId, 'hold');
          assert.equal(clientService.certVersion, '1.0');
          assert.equal(clientService.metadata.Authorization,
              'mocked-credentials');
        });
  });
  describe('The method', () => {
    afterEach(function() {
      sinon.restore();
    });

    /**
     * Mock for the signer library
     * @param {ClientServiceBase} service
     */
    function genericEllipticSignatureSigner(service) {
      sinon.replace(service.signer, 'sign',
          sinon.fake.returns(function() {
          }));
    }

    describe('registerCertificate', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedCertificateRegistrationRequest = {
          setCertHolderId: function() {
          },
          setCertVersion: function() {
          },
          setCertPem: function() {
          },
        };
        const mockedProtobuf = {
          CertificateRegistrationRequest: function() {
            return mockedCertificateRegistrationRequest;
          },
        };
        const clientServiceBase = new ClientServiceBase(
            {
              ledgerPrivileged: {
                registerCert: (_, __, callback) => {
                  const mockedResponse = {
                    toObject: () => ({}),
                  };
                  callback(null, mockedResponse);
                },
              },
            },
            mockedProtobuf,
            clientProperties,
        );
        genericEllipticSignatureSigner(clientServiceBase);
        const mockSpySetCertHolderId = sinon.spy(
            mockedCertificateRegistrationRequest,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(
            mockedCertificateRegistrationRequest,
            'setCertVersion');
        const mockSpySetCertPem = sinon.spy(
            mockedCertificateRegistrationRequest,
            'setCertPem');

        // act
        const response = await clientServiceBase.registerCertificate();

        // assert
        assert(mockSpySetCertHolderId.calledWithExactly(
            clientProperties['scalar.dl.client.cert_holder_id']));
        assert(mockSpySetCertVersion.calledWithExactly(
            clientProperties['scalar.dl.client.cert_version']));
        assert(mockSpySetCertPem.calledWithExactly(
            clientProperties['scalar.dl.client.cert_pem']));
        assert.isUndefined(response);
      });
    });

    describe('registerFunction', () => {
      it('should throw an error when contractBytes is not a Uint8Array',
          async () => {
          // prepare
            const clientServiceBase = new ClientServiceBase(services, protobuf,
                clientProperties);

            // act assert
            try {
              await clientServiceBase.registerFunction('contract1', 'foo',
                  'wrongType');
            } catch (e) {
              assert.instanceOf(e, ClientError);
            }
          },
      );
      it('should work as expected', async () => {
        // prepare
        const mockedContractId = '12345';
        const mockedName = 'foo';
        const mockedByteCode = new Uint8Array([1, 2, 3]);
        const mockedFunctionRegistrationRequest = {
          setFunctionId: function() {
          },
          setFunctionBinaryName: function() {
          },
          setFunctionByteCode: function() {
          },
        };
        const mockedProtobuf = {
          FunctionRegistrationRequest: function() {
            return mockedFunctionRegistrationRequest;
          },
        };
        const clientServiceBase = new ClientServiceBase(
            {
              ledgerPrivileged: {
                registerFunction: (_, __, callback) => {
                  const mockedResponse = {
                    toObject: () => ({}),
                  };
                  callback(null, mockedResponse);
                },
              },
            },
            mockedProtobuf,
            clientProperties,
        );
        genericEllipticSignatureSigner(clientServiceBase);
        const mockSpyFunctionRegistrationRequest = sinon.spy(mockedProtobuf,
            'FunctionRegistrationRequest');
        const mockSpySetFunctionId = sinon.spy(
            mockedFunctionRegistrationRequest, 'setFunctionId');
        const mockSpySetFunctionBinaryName = sinon.spy(
            mockedFunctionRegistrationRequest, 'setFunctionBinaryName');
        const mockSpySetFunctionByteCode = sinon.spy(
            mockedFunctionRegistrationRequest, 'setFunctionByteCode');

        // act
        const response = await clientServiceBase.registerFunction(
            mockedContractId,
            mockedName, mockedByteCode, clientProperties);

        // assert
        assert(mockSpyFunctionRegistrationRequest.calledOnce);
        assert(mockSpySetFunctionId.calledWithExactly(mockedContractId));
        assert(mockSpySetFunctionBinaryName.calledWithExactly(mockedName));
        assert(mockSpySetFunctionByteCode.calledWithExactly(mockedByteCode));
        assert.isUndefined(response);
      });
    });

    describe('registerContract', () => {
      it('should throw an error when contractBytes is not a Uint8Array',
          async () => {
          // prepare
            const clientServiceBase = new ClientServiceBase(
                services, protobuf, clientProperties);

            // act assert
            try {
              await clientServiceBase.registerContract('contract1', 'foo',
                  'wrongType');
            } catch (e) {
              assert.instanceOf(e, ClientError);
            }
          },
      );
      it('should work as expected', async () => {
        // prepare
        const mockedContractId = '12345';
        const mockedName = 'foo';
        const mockedByteCode = new Uint8Array([1, 2, 3]);
        const mockedPropertiesJson = JSON.stringify(clientProperties);
        const mockedContractRegistrationRequest = {
          setContractId: function() {
          },
          setContractBinaryName: function() {
          },
          setContractByteCode: function() {
          },
          setContractProperties: function() {
          },
          setCertHolderId: function() {
          },
          setCertVersion: function() {
          },
          setSignature: function() {
          },
        };
        const mockedProtobuf = {
          ContractRegistrationRequest: function() {
            return mockedContractRegistrationRequest;
          },
        };
        const clientServiceBase = new ClientServiceBase(
            {
              ledgerClient: {
                registerContract: (_, __, callback) => {
                  const mockedResponse = {
                    toObject: () => ({}),
                  };
                  callback(null, mockedResponse);
                },
              },

            },
            mockedProtobuf,
            clientProperties,
        );
        genericEllipticSignatureSigner(clientServiceBase);
        const mockSpyContractRegistrationRequest = sinon.spy(
            mockedProtobuf,
            'ContractRegistrationRequest');
        const mockSpySetContractBinaryName = sinon.spy(
            mockedContractRegistrationRequest,
            'setContractBinaryName');
        const mockSpySetContractId = sinon.spy(
            mockedContractRegistrationRequest,
            'setContractId');
        const mockSpySetContractByteCode = sinon.spy(
            mockedContractRegistrationRequest,
            'setContractByteCode');
        const mockSpySetContractProperties = sinon.spy(
            mockedContractRegistrationRequest,
            'setContractProperties');
        const mockSpySetCertHolderId = sinon.spy(
            mockedContractRegistrationRequest,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(
            mockedContractRegistrationRequest,
            'setCertVersion');
        const mockSpySetSignature = sinon.spy(
            mockedContractRegistrationRequest,
            'setSignature');

        // act
        const response = await clientServiceBase.registerContract(
            mockedContractId,
            mockedName, mockedByteCode, clientProperties);

        // assert
        assert(
            mockSpySetContractId.calledWithExactly(mockedContractId));
        assert(mockSpyContractRegistrationRequest.calledOnce);
        assert(mockSpySetContractBinaryName.calledWithExactly(
            mockedName));
        assert(mockSpySetContractByteCode.calledWithExactly(
            mockedByteCode));
        assert(mockSpySetContractProperties.calledWithExactly(
            mockedPropertiesJson));
        assert(mockSpySetCertHolderId.calledWithExactly(
            clientProperties['scalar.dl.client.cert_holder_id']));
        assert(mockSpySetCertVersion.calledWithExactly(
            clientProperties['scalar.dl.client.cert_version']));
        assert(mockSpySetSignature.calledOnce);
        assert.isUndefined(response);
      });
    });
    describe('listContract', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedContractId = '12345';
        const mockedListContracts = {
          setCertHolderId: function() {
          },
          setCertVersion: function() {
          },
          setContractId: function() {
          },
          setSignature: function() {
          },
        };
        const mockedProtobuf = {
          ContractsListingRequest: function() {
            return mockedListContracts;
          },
        };
        const clientServiceBase = new ClientServiceBase(
            {
              ledgerClient: {
                listContracts: (_, __, callback) => {
                  const mockedResponse = {
                    toObject: () => ({
                      json: '{}',
                    }),
                  };
                  callback(null, mockedResponse);
                },
              },
            },
            mockedProtobuf,
            clientProperties,
        );
        const mockSpyContractsListingRequest = sinon.spy(
            mockedProtobuf,
            'ContractsListingRequest');
        const mockSpySetCertHolderId = sinon.spy(mockedListContracts,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(mockedListContracts,
            'setCertVersion');
        const mockSpySetContractId = sinon.spy(mockedListContracts,
            'setContractId');
        const mockSpySetSignature = sinon.spy(mockedListContracts,
            'setSignature');
        genericEllipticSignatureSigner(clientServiceBase);

        // act
        const response = await clientServiceBase
            .listContracts(mockedContractId);

        // assert
        assert(mockSpyContractsListingRequest.calledOnce);
        assert(mockSpySetCertHolderId.calledWithExactly(
            clientProperties['scalar.dl.client.cert_holder_id']));
        assert(mockSpySetCertVersion.calledWithExactly(
            clientProperties['scalar.dl.client.cert_version']));
        assert(
            mockSpySetContractId.calledWithExactly(mockedContractId));
        assert(mockSpySetSignature.calledOnce);
        assert.instanceOf(response, Object);
      });
    });
    describe('validateLedger', () => {
      const mockedAssetId = 'contractId';
      it('should work as expected', async () => {
        // prepare
        const mockedValidateLedger = {
          setAssetId: function() {
          },
          setCertHolderId: function() {
          },
          setCertVersion: function() {
          },
          setSignature: function() {
          },
        };
        const mockedProtobuf = {
          LedgerValidationRequest: function() {
            return mockedValidateLedger;
          },
        };
        const clientServiceBase = new ClientServiceBase(
            {
              ledgerClient: {
                validateLedger: (_, __, callback) => {
                  const mockProof = {
                    getAssetId: () => 'asset-id',
                    getAge: () => 1,
                    getHash_asU8: () => null,
                    getNonce: () => 'nonce',
                    getSignature_asU8: () => null,
                  };
                  const mockedResponse = {
                    getStatusCode: () => 0,
                    getProof: () => mockProof,
                  };
                  callback(null, mockedResponse);
                },
              },
            },
            mockedProtobuf,
            clientProperties,
        );
        const mockSpyLedgerValidationRequest = sinon.spy(
            mockedProtobuf,
            'LedgerValidationRequest');
        const mockSpySetAssetId = sinon.spy(mockedValidateLedger,
            'setAssetId');
        const mockSpySetCertHolderId = sinon.spy(mockedValidateLedger,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(mockedValidateLedger,
            'setCertVersion');
        const mockSpySetSignature = sinon.spy(mockedValidateLedger,
            'setSignature');
        genericEllipticSignatureSigner(clientServiceBase);

        // act
        const response = await clientServiceBase.validateLedger(mockedAssetId);

        // assert
        assert(mockSpyLedgerValidationRequest.calledOnce);
        assert(mockSpySetAssetId.calledWithExactly(mockedAssetId));
        assert(mockSpySetCertHolderId.calledWithExactly(
            clientProperties['scalar.dl.client.cert_holder_id']));
        assert(mockSpySetCertVersion.calledWithExactly(
            clientProperties['scalar.dl.client.cert_version']));
        assert(mockSpySetSignature.calledOnce);
        assert.instanceOf(response, LedgerValidationResult);
      });
    });
    describe('executeContract', () => {
      // prepare
      const mockedContractId = '12345';
      const mockedArgument = {'mocked': 'argument'};
      const mockedFunctionArgument = 'mockedFunctionArgument';
      const mockedFunctionArgumentJson = JSON.stringify(
          mockedFunctionArgument);
      it('should work as expected', async () => {
        const mockedExecuteContract = {
          setContractId: function() {
          },
          setContractArgument: function() {
          },
          setCertHolderId: function() {
          },
          setCertVersion: function() {
          },
          setFunctionArgument: function() {
          },
          setSignature: function() {
          },
        };
        const mockedProtobuf = {
          ContractExecutionRequest: function() {
            return mockedExecuteContract;
          },
        };

        const clientServiceBase = new ClientServiceBase(
            {
              ledgerClient: {
                executeContract: (_, __, callback) => {
                  const mockProof = {
                    getAssetId: () => 'asset-id',
                    getAge: () => 1,
                    getHash_asU8: () => null,
                    getNonce: () => 'nonce',
                    getSignature_asU8: () => null,
                  };
                  const mockedResponse = {
                    getResult: () => '',
                    getProofsList: () => [mockProof],
                  };
                  callback(null, mockedResponse);
                },
              },
            },
            mockedProtobuf,
            clientProperties);
        const mockSpyContractExecutionRequest = sinon.spy(
            mockedProtobuf,
            'ContractExecutionRequest');
        const mockSpySetContractId = sinon.spy(mockedExecuteContract,
            'setContractId');
        const mockSpySetContractArgument = sinon.spy(
            mockedExecuteContract,
            'setContractArgument');
        const mockSpySetCertHolderId = sinon.spy(
            mockedExecuteContract,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(mockedExecuteContract,
            'setCertVersion');
        const mockSpySetFunctionArgument = sinon.spy(
            mockedExecuteContract,
            'setFunctionArgument');
        const mockSpySetSignature = sinon.spy(mockedExecuteContract,
            'setSignature');
        genericEllipticSignatureSigner(clientServiceBase);

        // act
        const response = await clientServiceBase.executeContract(
            mockedContractId,
            mockedArgument, mockedFunctionArgument);

        // assert
        assert(mockSpyContractExecutionRequest.calledOnce);
        assert(
            mockSpySetContractId.calledWithExactly(mockedContractId));
        assert(mockSpySetContractArgument.calledWith(
            sinon.match(mockedArgument.mocked)));
        assert(mockSpySetCertHolderId.calledWithExactly(
            clientProperties['scalar.dl.client.cert_holder_id']));
        assert(mockSpySetCertVersion.calledWithExactly(
            clientProperties['scalar.dl.client.cert_version']));
        assert(mockSpySetSignature.calledOnce);
        assert(mockSpySetFunctionArgument.calledWithExactly(
            mockedFunctionArgumentJson));

        assert.instanceOf(response, ContractExecutionResult);
      });
    });
    describe('_executePromise', () => {
      it('should parse and rethrow error on Node.js environment', async () => {
        const status = {'code': 404, 'message': 'foo message'};
        const toObject = sinon.stub()
            .returns(status);
        const GrpcStatusObject = {'toObject': toObject};
        const deserializeBinaryStub = sinon.stub()
            .withArgs(status)
            .returns(GrpcStatusObject);
        const GrpcStatus = {'deserializeBinary': deserializeBinaryStub};
        const protobuf = {'Status': GrpcStatus};
        const clientServiceBase = new ClientServiceBase(
            services, protobuf, clientProperties);
        environmentStub = sinon.stub(clientServiceBase, '_isNodeJsRuntime')
            .returns(true);
        const binaryStatus = [status];
        const errorStub = new Error();
        const metadataStub = {
          'get': function() {
          },
        };
        errorStub.metadata = metadataStub;
        const getStub = sinon.stub(metadataStub, 'get');
        getStub.withArgs(ClientServiceBase.binaryStatusKey)
            .returns(binaryStatus);

        try {
          const promise = new Promise((resolve, reject) => {
            throw errorStub;
          });
          await clientServiceBase._executePromise(promise);
        } catch (e) {
          assert.equal(e.constructor.name, 'ClientError');
          assert.equal(e.code, status.code);
          assert.equal(e.message, status.message);
        }
      });
      it('should parse and rethrow error on browser environment', async () => {
        const status = {'code': 404, 'message': 'foo message'};
        const toObject = sinon.stub()
            .returns(status);
        const GrpcStatusObject = {'toObject': toObject};
        const deserializeBinaryStub = sinon.stub()
            .withArgs(status)
            .returns(GrpcStatusObject);
        const GrpcStatus = {'deserializeBinary': deserializeBinaryStub};
        const protobuf = {'Status': GrpcStatus};
        const clientServiceBase = new ClientServiceBase(
            services, protobuf, clientProperties);
        environmentStub = sinon.stub(clientServiceBase, '_isNodeJsRuntime')
            .returns(false);
        const metadata = {};
        metadata[ClientServiceBase.binaryStatusKey] = status;
        const errorStub = new Error('bar message');
        errorStub.metadata = metadata;
        try {
          const promise = new Promise((resove, reject) => {
            throw errorStub;
          });
          await clientServiceBase._executePromise(promise);
        } catch (e) {
          assert.equal(e.constructor.name, 'ClientError');
          assert.equal(e.code, status.code);
          assert.equal(e.message, status.message);
        }
      });
      it('should rethrow error when there is no error status', async () => {
        const clientServiceBase = new ClientServiceBase(
            services, protobuf, clientProperties);
        environmentStub = sinon.stub(clientServiceBase, '_isNodeJsRuntime')
            .returns(false);
        const errorStub = new Error('bar message');
        errorStub.metadata = {};
        try {
          const promise = new Promise((resove, reject) => {
            throw errorStub;
          });
          await clientServiceBase._executePromise(promise);
        } catch (e) {
          assert.equal(e.constructor.name, 'ClientError');
          assert.equal(
              e.code,
              StatusCode.UNKNOWN_TRANSACTION_STATUS,
          );
          assert.equal(e.message, errorStub.message);
        }
      });
    });
  });
});
