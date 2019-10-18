const {
  ClientServiceBase,
} = require('..');
const {
  IllegalArgumentError,
} = require('../illegal_argument_error');
const sinon = require('sinon');
const jsrsasign = require('jsrsasign');
const {SignatureSigner} = require('../signer');
const elliptic = require('elliptic');
const crypto = require('crypto');
const assert = require('chai').assert;
const ledgerClient = {};
const protobuf = {};
const ledgerPrivileged = {};
const proofRegistry = {};
const clientProperties = {
  'scalar.ledger.client.private_key_pem': 'key',
  'scalar.ledger.client.cert_pem': 'cert',
  'scalar.ledger.client.cert_holder_id': 'hold',
};

describe('Class ClientServiceBase', () => {
  describe('The constructor', () => {
    describe('should throw an error', () => {
      it('when the private key is missing', () => {
        const clientProperties = {
          // "scalar.ledger.client.private_key_pem": "key",
          'scalar.ledger.client.cert_pem': 'cert',
          'scalar.ledger.client.cert_holder_id': 'hold',
        };
        assert.throws(() => {
          new ClientServiceBase(ledgerClient, ledgerPrivileged, proofRegistry,
              protobuf, clientProperties);
        }, IllegalArgumentError, 'private_key_pem');
      });
      it('when the certificate is missing', () => {
        const clientProperties = {
          'scalar.ledger.client.private_key_pem': 'key',
          // 'scalar.ledger.client.cert_pem': 'cert',
          'scalar.ledger.client.cert_holder_id': 'hold',
        };
        assert.throws(() => {
          new ClientServiceBase(ledgerClient, ledgerPrivileged, proofRegistry,
              protobuf, clientProperties);
        }, IllegalArgumentError, 'cert_pem');
      });
      it('when holder id is missing', () => {
        const clientProperties = {
          'scalar.ledger.client.private_key_pem': 'key',
          'scalar.ledger.client.cert_pem': 'cert',
          'scalar.ledger.client.server_host': 'host',
          // 'scalar.ledger.client.cert_holder_id': 'hold',
        };
        assert.throws(() => {
          new ClientServiceBase(ledgerClient, ledgerPrivileged, proofRegistry,
              protobuf, clientProperties);
        }, IllegalArgumentError, 'cert_holder_id');
      });
    });
    it('should properly load the attribute according to the given property',
        () => {
          const clientProperties = {
            'scalar.ledger.client.private_key_pem': 'key',
            'scalar.ledger.client.cert_pem': 'cert',
            'scalar.ledger.client.cert_holder_id': 'hold',
            'scalar.ledger.client.cert_version': '1.0',
            'scalar.ledger.client.authorization.credential':
                'mocked-credentials',
          };
          const service = new ClientServiceBase(ledgerClient, ledgerPrivileged,
              proofRegistry, protobuf, clientProperties);
          assert.equal(service.privateKeyPem, 'key');
          assert.equal(service.certPem, 'cert');
          assert.equal(service.certHolderId, 'hold');
          assert.equal(service.certVersion, '1.0');
          assert.equal(service.metadata.Authorization, 'mocked-credentials');
        });
  });
  describe('The method', () => {
    afterEach(function() {
      sinon.restore();
    });

    // Mock for the signer library
    function genericEllipticSignatureSigner(service) {
      sinon.replace(service.signer, 'sign',
          sinon.fake.returns(function() {}));
      sinon.replace(service, 'sendRequest',
          sinon.fake.returns(function() {}));
    }

    describe('registerCertificate', () => {
      it('should work as expected', async () => {
        const mockedCertificateRegistrationRequest = {
          setCertHolderId: function() {},
          setCertVersion: function() {},
          setCertPem: function() {},
        };
        const mockedProtobuf = {
          CertificateRegistrationRequest: function() {
            return mockedCertificateRegistrationRequest;
          },
        };
        const service = new ClientServiceBase(
            ledgerClient, ledgerPrivileged, proofRegistry, mockedProtobuf,
            clientProperties);
        genericEllipticSignatureSigner(service);
        const mockSpySetCertHolderId = sinon.spy(
            mockedCertificateRegistrationRequest,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(
            mockedCertificateRegistrationRequest,
            'setCertVersion');
        const mockSpySetCertPem = sinon.spy(
            mockedCertificateRegistrationRequest,
            'setCertPem');
        const request = await service.registerCertificate();

        assert(mockSpySetCertHolderId.calledOnce);
        assert(mockSpySetCertVersion.calledOnce);
        assert(mockSpySetCertPem.calledOnce);
        assert.instanceOf(request, Function);
      });

    });

    describe('registerContract', () => {
      it('should throw an error when contractBytes is not a Uint8Array',
          async () => {
            const service = new ClientServiceBase(
                ledgerClient, ledgerPrivileged, proofRegistry, protobuf,
                clientProperties);
            try {
              await service.registerContract('contract1', 'foo', 'wrongType');
            } catch (e) {
              assert.instanceOf(e, IllegalArgumentError);
            }
          },
      );
      it('should work as expected', async () => {
        const mockedContractRegistrationRequest = {
          setContractId: function() {},
          setContractBinaryName: function() {},
          setContractByteCode: function() {},
          setContractProperties: function() {},
          setCertHolderId: function() {},
          setCertVersion: function() {},
          setSignature: function() {},
        };
        const mockedProtobuf = {
          ContractRegistrationRequest: function() {
            return mockedContractRegistrationRequest;
          },
        };
        const service = new ClientServiceBase(ledgerClient, ledgerPrivileged,
            proofRegistry, mockedProtobuf, clientProperties);
        genericEllipticSignatureSigner(service);
        const mockSpyContractRegistrationRequest = sinon.spy(mockedProtobuf,
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
        const request = await service.registerContract('contractId', 'foo',
            new Uint8Array([1, 2, 3]), clientProperties);
        assert(mockSpySetContractId.calledOnce);
        assert(mockSpyContractRegistrationRequest.calledOnce);
        assert(mockSpySetContractBinaryName.calledOnce);
        assert(mockSpySetContractByteCode.calledOnce);
        assert(mockSpySetContractProperties.calledOnce);
        assert(mockSpySetCertHolderId.calledOnce);
        assert(mockSpySetCertVersion.calledOnce);
        assert(mockSpySetSignature.calledOnce);
        assert.instanceOf(request, Function);
      });
    });
    describe('listContract', () => {
      it('should work as expected', async () => {
        const mockedListContracts = {
          setCertHolderId: function() {},
          setCertVersion: function() {},
          setContractId: function() {},
          setSignature: function() {},
        };
        const mockedProtobuf = {
          ContractsListingRequest: function() {
            return mockedListContracts;
          },
        };
        const service = new ClientServiceBase(ledgerClient, ledgerPrivileged,
            proofRegistry, mockedProtobuf, clientProperties);
        const mockSpyContractsListingRequest = sinon.spy(mockedProtobuf,
            'ContractsListingRequest');
        const mockSpySetCertHolderId = sinon.spy(mockedListContracts,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(mockedListContracts,
            'setCertVersion');
        const mockSpySetContractId = sinon.spy(mockedListContracts,
            'setContractId');
        const mockSpySetSignature = sinon.spy(mockedListContracts,
            'setSignature');
        genericEllipticSignatureSigner(service);
        const request = await service.listContracts('contractId');
        assert(mockSpyContractsListingRequest.calledOnce);
        assert(mockSpySetCertHolderId.calledOnce);
        assert(mockSpySetCertVersion.calledOnce);
        assert(mockSpySetContractId.calledOnce);
        assert(mockSpySetSignature.calledOnce);
        assert.instanceOf(request, Function);
      });
    });
    describe('validateLedger', () => {
      it('should work as expected', async () => {
        const mockedValidateLedger = {
          setAssetId: function() {},
          setCertHolderId: function() {},
          setCertVersion: function() {},
          setSignature: function() {},
        };
        const mockedProtobuf = {
          LedgerValidationRequest: function() {
            return mockedValidateLedger;
          },
        };
        const service = new ClientServiceBase(ledgerClient, ledgerPrivileged,
            proofRegistry, mockedProtobuf, clientProperties);
        const mockSpyLedgerValidationRequest = sinon.spy(mockedProtobuf,
            'LedgerValidationRequest');
        const mockSpySetAssetId = sinon.spy(mockedValidateLedger,
            'setAssetId');
        const mockSpySetCertHolderId = sinon.spy(mockedValidateLedger,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(mockedValidateLedger,
            'setCertVersion');
        const mockSpySetSignature = sinon.spy(mockedValidateLedger,
            'setSignature');
        genericEllipticSignatureSigner(service);
        const request = await service.validateLedger('contractId');
        assert(mockSpyLedgerValidationRequest.calledOnce);
        assert(mockSpySetAssetId.calledOnce);
        assert(mockSpySetCertHolderId.calledOnce);
        assert(mockSpySetCertVersion.calledOnce);
        assert(mockSpySetSignature.calledOnce);
        assert.instanceOf(request, Function);
      });
    });
    describe('executeContract', () => {
      it('should work as expected', async () => {
        const mockedExecuteContract = {
          setContractId: function() {},
          setContractArgument: function() {},
          setCertHolderId: function() {},
          setCertVersion: function() {},
          setFunctionArgument: function() {},
          setSignature: function() {},
        };
        const mockedProtobuf = {
          ContractExecutionRequest: function() {
            return mockedExecuteContract;
          },
        };
        const service = new ClientServiceBase(ledgerClient, ledgerPrivileged,
            proofRegistry, mockedProtobuf, clientProperties);
        const mockSpyContractExecutionRequest = sinon.spy(mockedProtobuf,
            'ContractExecutionRequest');
        const mockSpySetContractId = sinon.spy(mockedExecuteContract,
            'setContractId');
        const mockSpySetContractArgument = sinon.spy(mockedExecuteContract,
            'setContractArgument');
        const mockSpySetCertHolderId = sinon.spy(mockedExecuteContract,
            'setCertHolderId');
        const mockSpySetCertVersion = sinon.spy(mockedExecuteContract,
            'setCertVersion');
        const mockSpySetFunctionArgument = sinon.spy(mockedExecuteContract,
            'setFunctionArgument');
        const mockSpySetSignature = sinon.spy(mockedExecuteContract,
            'setSignature');
        genericEllipticSignatureSigner(service);
        const request = await service.executeContract('contractId',
            {'mocked': 'argument'});
        assert(mockSpyContractExecutionRequest.calledOnce);
        assert(mockSpySetContractId.calledOnce);
        assert(mockSpySetContractArgument.calledOnce);
        assert(mockSpySetCertHolderId.calledOnce);
        assert(mockSpySetCertVersion.calledOnce);
        assert(mockSpySetSignature.calledOnce);
        assert(mockSpySetFunctionArgument.calledOnce);
        assert.instanceOf(request, Function);
      });
    });
    describe('sendRequest', () => {
      it('should reject on anonymous function name', async () => {
        const mock = {
          setMessage: function() {},
          setStatus: function() {},
        };
        const mockSpySetMessage = sinon.spy(mock, 'setMessage');
        const mockSpySetStatus = sinon.spy(mock, 'setStatus');
        const mockedProtobuf = {
          LedgerServiceResponse: function() {
            return mock;
          },
        };
        const service = new ClientServiceBase(ledgerClient, ledgerPrivileged,
            proofRegistry, mockedProtobuf, clientProperties);
        await service.sendRequest('registerCert', () => {
          throw new Error();
        });
        sinon.assert.calledOnce(mockSpySetMessage);
        sinon.assert.calledOnce(mockSpySetStatus);
      });
    });
  });
});
