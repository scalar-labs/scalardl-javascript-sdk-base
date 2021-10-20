const {
  ClientServiceBase,
  StatusCode,
  ClientError,
  ContractExecutionResult,
  LedgerValidationResult,
} = require('..');

const sinon = require('sinon');
const assert = require('chai').assert;
const expect = require('chai').expect;
const protobuf = {};
const services = {
  'ledgerPrivileged': {},
  'ledgerClient': {},
};
const chai = require('chai');
chai.use(require('chai-as-promised'));

const clientProperties = {
  'scalar.dl.client.private_key_pem': '-----BEGIN EC PRIVATE KEY-----\n' +
      'MHcCAQEEICcJGMEw3dyXUGFu/5a36HqY0ynZi9gLUfKgYWMYgr/IoAoGCCqGSM49\n' +
      'AwEHoUQDQgAEBGuhqumyh7BVNqcNKAQQipDGooUpURve2dO66pQCgjtSfu7lJV20\n' +
      'XYWdrgo0Y3eXEhvK0lsURO9N0nrPiQWT4A==\n-----END EC PRIVATE KEY-----\n',
  'scalar.dl.client.cert_pem': '-----BEGIN CERTIFICATE-----\n' +
      'MIICizCCAjKgAwIBAgIUMEUDTdWsQpftFkqs6bCd6U++4nEwCgYIKoZIzj0EAwIw\n' +
      'bzELMAkGA1UEBhMCSlAxDjAMBgNVBAgTBVRva3lvMQ4wDAYDVQQHEwVUb2t5bzEf\n' +
      'MB0GA1UEChMWU2FtcGxlIEludGVybWVkaWF0ZSBDQTEfMB0GA1UEAxMWU2FtcGxl\n' +
      'IEludGVybWVkaWF0ZSBDQTAeFw0xODA5MTAwODA3MDBaFw0yMTA5MDkwODA3MDBa\n' +
      'MEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIEwpTb21lLVN0YXRlMSEwHwYDVQQKExhJ\n' +
      'bnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNC\n' +
      'AAQEa6Gq6bKHsFU2pw0oBBCKkMaihSlRG97Z07rqlAKCO1J+7uUlXbRdhZ2uCjRj\n' +
      'd5cSG8rSWxRE703Ses+JBZPgo4HVMIHSMA4GA1UdDwEB/wQEAwIFoDATBgNVHSUE\n' +
      'DDAKBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBRDd2MS9Ndo68PJ\n' +
      'y9K/RNY6syZW0zAfBgNVHSMEGDAWgBR+Y+v8yByDNp39G7trYrTfZ0UjJzAxBggr\n' +
      'BgEFBQcBAQQlMCMwIQYIKwYBBQUHMAGGFWh0dHA6Ly9sb2NhbGhvc3Q6ODg4OTAq\n' +
      'BgNVHR8EIzAhMB+gHaAbhhlodHRwOi8vbG9jYWxob3N0Ojg4ODgvY3JsMAoGCCqG\n' +
      'SM49BAMCA0cAMEQCIC/Bo4oNU6yHFLJeme5ApxoNdyu3rWyiqWPxJmJAr9L0AiBl\n' +
      'Gc/v+yh4dHIDhCrimajTQAYOG9n0kajULI70Gg7TNw==\n' +
      '-----END CERTIFICATE-----\n',
  'scalar.dl.client.cert_holder_id': 'hold',
  'scalar.dl.client.cert_version': 1,
};

describe('Class ClientServiceBase', () => {
  describe('The method', () => {
    afterEach(function() {
      sinon.restore();
    });

    describe('registerCertificate', () => {
      it('should throw error when some properties are not provied',
          async () => {
            const clientServiceBase = new ClientServiceBase(
                {}, // service
                null, // protobuf
                {}, // properties
            );
            await expect(
                clientServiceBase.registerCertificate(),
            ).to.be.rejected;
          },
      );
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
      it('should throw error when some properties are not provied',
          async () => {
            const clientServiceBase = new ClientServiceBase(
                {}, // service
                null, // protobuf
                {}, // properties
            );
            await expect(
                clientServiceBase.registerContract(
                    'contract1',
                    'foo',
                    'wrongType',
                ),
            ).to.be.rejected;
          },
      );
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
        const mockedSigner = {
          sign: function() {
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
              signerFactory: {
                create: () => mockedSigner,
              },
            },
            mockedProtobuf,
            clientProperties,
        );
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
        const mockSpySign = sinon.spy(mockedSigner, 'sign');

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
        assert(mockSpySign.calledOnce);
        assert.isUndefined(response);
      });
    });
    describe('listContract', () => {
      it('should throw error when some properties are not provied',
          async () => {
            const clientServiceBase = new ClientServiceBase(
                {}, // service
                null, // protobuf
                {}, // properties
            );
            await expect(
                clientServiceBase.registerContract('whatever'),
            ).to.be.rejected;
          },
      );
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
        const mockedSigner = {
          sign: function() {
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
              signerFactory: {
                create: () => mockedSigner,
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
        const mockSpySign = sinon.spy(mockedSigner, 'sign');

        // act
        const response = await clientServiceBase.listContracts(
            mockedContractId);

        // assert
        assert(mockSpyContractsListingRequest.calledOnce);
        assert(mockSpySetCertHolderId.calledWithExactly(
            clientProperties['scalar.dl.client.cert_holder_id']));
        assert(mockSpySetCertVersion.calledWithExactly(
            clientProperties['scalar.dl.client.cert_version']));
        assert(
            mockSpySetContractId.calledWithExactly(mockedContractId));
        assert(mockSpySetSignature.calledOnce);
        assert(mockSpySign.calledOnce);
        assert.instanceOf(response, Object);
      });
    });
    describe('validateLedger', () => {
      it('should throw error when some properties are not provided',
          async () => {
            const clientServiceBase = new ClientServiceBase(
                {}, // service
                null, // protobuf
                {}, // properties
            );
            await expect(
                clientServiceBase.validateLedger('whatever'),
            ).to.be.rejected;
          },
      );
      it('should throw an error when startAge is not valid',
          async () => {
            const clientServiceBase = new ClientServiceBase(
                {}, // service
                null, // protobuf
                {}, // properties
            );
            await expect(
                clientServiceBase.validateLedger('whatever', -1, 3),
            ).to.be.rejected;
          },
      );
      it('should throw an error when endAge is not valid',
          async () => {
            const clientServiceBase = new ClientServiceBase(
                {}, // service
                null, // protobuf
                {}, // properties
            );
            await expect(
                clientServiceBase.validateLedger(
                    'whatever',
                    0,
                    100000000000000000,
                ),
            ).to.be.rejected;
          },
      );
      it('should throw an error when endAge is inferior to startAge',
          async () => {
            const clientServiceBase = new ClientServiceBase(
                {}, // service
                null, // protobuf
                {}, // properties
            );
            await expect(
                clientServiceBase.validateLedger('whatever', 3, 2),
            ).to.be.rejected;
          },
      );
      const mockedAssetId = 'contractId';
      it('should work as expected', async () => {
        // prepare
        const mockedValidateLedger = {
          setAssetId: function() {
          },
          setStartAge: function() {
          },
          setEndAge: function() {
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
        const mockedSigner = {
          sign: function() {
          },
        };
        const clientServiceBase = new ClientServiceBase(
            {
              ledgerClient: {
                validateLedger: (_, __, callback) => {
                  const mockProof = {
                    getAssetId: () => 'asset-id',
                    getAge: () => 1,
                    getHash_asU8: () => new Uint8Array([1, 2, 3]),
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
              signerFactory: {
                create: () => mockedSigner,
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
        const mockSpySign = sinon.spy(mockedSigner, 'sign');

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
        assert(mockSpySign.calledOnce);
        assert.instanceOf(response, LedgerValidationResult);

        const assetProof = response.getProof();
        assert.equal(assetProof.getId(), 'asset-id');
        assert.equal(assetProof.getAge(), 1);
        assert.deepEqual(assetProof.getHash(), new Uint8Array([1, 2, 3]));
        assert.equal(assetProof.getNonce(), 'nonce');
        assert.deepEqual(assetProof.getSignature(), new Uint8Array());
      });
    });
    describe('executeContract', () => {
      it('should throw error when some properties are not provied',
          async () => {
            const clientServiceBase = new ClientServiceBase(
                {}, // service
                null, // protobuf
                {}, // properties
            );
            await expect(
                clientServiceBase.executeContract('id', {}, {}),
            ).to.be.rejected;
          },
      );
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
        const mockedSigner = {
          sign: function() {
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
                    getSignature_asU8: () => new Uint8Array([1, 2, 3]),
                  };
                  const mockedResponse = {
                    getResult: () => '',
                    getProofsList: () => [mockProof],
                  };
                  callback(null, mockedResponse);
                },
              },
              signerFactory: {
                create: () => mockedSigner,
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
        const mockSpySign = sinon.spy(mockedSigner, 'sign');

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
        assert(mockSpySign.calledOnce);
        assert(mockSpySetFunctionArgument.calledWithExactly(
            mockedFunctionArgumentJson));

        assert.instanceOf(response, ContractExecutionResult);

        const assetProof = response.getProofs()[0];
        assert.equal(assetProof.getId(), 'asset-id');
        assert.equal(assetProof.getAge(), 1);
        assert.deepEqual(assetProof.getHash(), new Uint8Array());
        assert.equal(assetProof.getNonce(), 'nonce');
        assert.deepEqual(assetProof.getSignature(), new Uint8Array([1, 2, 3]));
      });
    });
    describe('_executePromise', () => {
      it('should parse and rethrow error on Node.js environment', async () => {
        const status = {'code': 404, 'message': 'foo message'};
        const toObject = sinon.stub().returns(status);
        const GrpcStatusObject = {'toObject': toObject};
        const deserializeBinaryStub = sinon.stub().
            withArgs(status).
            returns(GrpcStatusObject);
        const GrpcStatus = {'deserializeBinary': deserializeBinaryStub};
        const protobuf = {'Status': GrpcStatus};
        const clientServiceBase = new ClientServiceBase(
            services, protobuf, clientProperties);
        environmentStub = sinon.stub(clientServiceBase, '_isNodeJsRuntime').
            returns(true);
        const binaryStatus = [status];
        const errorStub = new Error();
        const metadataStub = {
          'get': function() {
          },
        };
        errorStub.metadata = metadataStub;
        const getStub = sinon.stub(metadataStub, 'get');
        getStub.withArgs(ClientServiceBase.binaryStatusKey).
            returns(binaryStatus);

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
        const toObject = sinon.stub().returns(status);
        const GrpcStatusObject = {'toObject': toObject};
        const deserializeBinaryStub = sinon.stub().
            withArgs(status).
            returns(GrpcStatusObject);
        const GrpcStatus = {'deserializeBinary': deserializeBinaryStub};
        const protobuf = {'Status': GrpcStatus};
        const clientServiceBase = new ClientServiceBase(
            services, protobuf, clientProperties);
        environmentStub = sinon.stub(clientServiceBase, '_isNodeJsRuntime').
            returns(false);
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
        environmentStub = sinon.stub(clientServiceBase, '_isNodeJsRuntime').
            returns(false);
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

    describe('validateLedger linearizably', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedSigner = {
          sign: function() {},
        };

        const mockedProtobuf = {
          ContractExecutionRequest: () => ({
            setContractId: function() {},
            setContractArgument: function() {},
            setCertHolderId: function() {},
            setCertVersion: function() {},
            setFunctionArgument: function() {},
            setSignature: function() {},
            setAuditorSignature: function() {},
          }),
          ExecutionValidationRequest: () => ({
            setRequest: function() {},
            setProofsList: function() {},
          }),
        };

        const mockedLedgerClient = {
          executeContract: (_, __, callback) => {
            callback(null, {
              getResult: () => '',
              getProofsList: () => [{
                getAssetId: () => 'foo',
                getAge: () => 1,
                getHash_asU8: () => new Uint8Array([0, 0, 0]),
                getNonce: () => 'nonce',
                getSignature_asU8: () => new Uint8Array([1, 2, 3]),
              }],
            });
          },
        };

        const mockedAuditorClient = {
          orderExecution: (_, __, callback) => {
            callback(null, {
              getSignature: () => null,
            });
          },
          validateExecution: (_, __, callback) => {
            callback(null, {
              getResult: () => '',
              getProofsList: () => [{
                getAssetId: () => 'foo',
                getAge: () => 1,
                getHash_asU8: () => new Uint8Array([0, 0, 0]),
                getNonce: () => 'nonce',
                getSignature_asU8: () => new Uint8Array([1, 2, 3]),
              }],
            });
          },
        };

        const clientServiceBase = new ClientServiceBase(
            {
              ledgerClient: mockedLedgerClient,
              auditorClient: mockedAuditorClient,
              signerFactory: {
                create: () => mockedSigner,
              },
            },
            mockedProtobuf,
            {
              ...clientProperties,
              'scalar.dl.client.auditor.enabled': true,
              'scalar.dl.client.auditor.linearizable_validation.enable': true,
            },
        );

        const spiedContractExecutionRequest = sinon.spy(
            mockedProtobuf,
            'ContractExecutionRequest',
        );

        const spiedExecuteContract = sinon.spy(
            mockedLedgerClient,
            'executeContract',
        );

        const spiedOrderExecution = sinon.spy(
            mockedAuditorClient,
            'orderExecution',
        );

        const spiedValidateExecution = sinon.spy(
            mockedAuditorClient,
            'validateExecution',
        );

        const spiedExecutionValidationRequest = sinon.spy(
            mockedProtobuf,
            'ExecutionValidationRequest',
        );

        const spiedSign = sinon.spy(mockedSigner, 'sign');

        // act
        const response = await clientServiceBase.validateLedger('foo');

        // assert
        assert(spiedContractExecutionRequest.calledOnce);
        assert(spiedExecutionValidationRequest.calledOnce);
        assert(spiedExecuteContract.calledOnce);
        assert(spiedOrderExecution.calledOnce);
        assert(spiedValidateExecution.calledOnce);
        assert(spiedSign.calledOnce);

        assert.instanceOf(response, LedgerValidationResult);

        const ledgerProof = response.getProof();
        const auditorProof = response.getAuditorProof();

        assert.equal(ledgerProof.getId(), 'foo');
        assert.equal(ledgerProof.getAge(), 1);
        assert.deepEqual(ledgerProof.getHash(), new Uint8Array([0, 0, 0]));
        assert.equal(ledgerProof.getNonce(), 'nonce');
        assert.deepEqual(
            ledgerProof.getSignature(),
            new Uint8Array([1, 2, 3]),
        );

        assert.equal(auditorProof.getId(), 'foo');
        assert.equal(auditorProof.getAge(), 1);
        assert.deepEqual(auditorProof.getHash(), new Uint8Array([0, 0, 0]));
        assert.equal(auditorProof.getNonce(), 'nonce');
        assert.deepEqual(
            auditorProof.getSignature(),
            new Uint8Array([1, 2, 3]),
        );
      });
    });
  });
});
