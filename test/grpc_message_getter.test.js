const {
  ClientError,
} = require('..');
const {GrpcMessageGetter} = require('../grpc_message_getter');
const {TextEncoder} = require('../request/builder');

const sinon = require('sinon');
const {EllipticSigner} = require("../signer");
const assert = require('chai').assert;
const clientProperties = {
  'scalar.dl.client.private_key_pem': 'key',
  'scalar.dl.client.cert_pem': 'cert',
  'scalar.dl.client.cert_holder_id': 'hold',
  'scalar.dl.client.cert_version': '1.0',
};

describe('Class GrpcMessageGetter', () => {
  describe('The constructor', () => {
    describe('should throw an error', () => {
      it('when the private key is missing', () => {
        // prepare
        const clientProperties = {
          // "scalar.dl.client.private_key_pem": "key",
          'scalar.dl.client.cert_pem': 'cert',
          'scalar.dl.client.cert_holder_id': 'hold',
        };

        // act assert
        assert.throws(() => {
          new GrpcMessageGetter(clientProperties);
        }, ClientError, 'private_key_pem');
      });
      it('when the certificate is missing', () => {
        // prepare
        const clientProperties = {
          'scalar.dl.client.private_key_pem': 'key',
          // 'scalar.dl.client.cert_pem': 'cert',
          'scalar.dl.client.cert_holder_id': 'hold',
        };

        // act assert
        assert.throws(() => {
          new GrpcMessageGetter(clientProperties);
        }, ClientError, 'cert_pem');
      });
      it('when holder id is missing', () => {
        // prepare
        const clientProperties = {
          'scalar.dl.client.private_key_pem': 'key',
          'scalar.dl.client.cert_pem': 'cert',
          // 'scalar.dl.client.cert_holder_id': 'hold',
        };

        // act assert
        assert.throws(() => {
          new GrpcMessageGetter(clientProperties);
        }, ClientError, 'cert_holder_id');
      });
    });
    it('should properly load the attribute according to the given property',
        () => {
          // prepare
          const clientProperties = {
            'scalar.dl.client.private_key_pem': 'key',
            'scalar.dl.client.cert_pem': 'cert',
            'scalar.dl.client.cert_holder_id': 'hold',
            'scalar.dl.client.cert_version': '1.0',
          };

          // act
          const grpcMessageGetter = new GrpcMessageGetter(clientProperties);

          // assert
          assert.equal(grpcMessageGetter.privateKeyPem, 'key');
          assert.equal(grpcMessageGetter.certPem, 'cert');
          assert.equal(grpcMessageGetter.certHolderId, 'hold');
          assert.equal(grpcMessageGetter.certVersion, '1.0');
        });
  });
  describe('The method', () => {
    const mockedReturns = 'mockedReturns';
    let grpcMessageGetter;

    afterEach(function () {
      sinon.restore();
    });

    beforeEach(function () {
      const clientProperties = {
        'scalar.dl.client.private_key_pem': 'key',
        'scalar.dl.client.cert_pem': 'cert',
        'scalar.dl.client.cert_holder_id': 'hold',
        'scalar.dl.client.cert_version': '1.0',
      };

      grpcMessageGetter = new GrpcMessageGetter(clientProperties)
    });

    /**
     * Mock for the signer library
     * @param {GrpcMessageGetter} grpcMessageGetter
     */
    function genericEllipticSignatureSigner(grpcMessageGetter) {
      sinon.replace(grpcMessageGetter.signer, 'sign',
          sinon.fake.returns(mockedReturns));
    }

    /**
     * @return {Uint8Array}
     * @param properties, object that contains all the required object to mock the buffer
     */
    function genericBufferArrayGenerator(properties) {
      let bufferSize = 0;
      let valueArray = [];

      Object.values(properties).forEach((value) => {
        if (value.constructor === String) {
          value = new TextEncoder('utf-8').encode(value);
        } else if (value.constructor === Number) {
          value = new TextEncoder('utf-8').encode(value.toString());
        } else if (value.constructor === Object) {
          value = new TextEncoder('utf-8').encode(JSON.stringify(value));
        } else if (value instanceof EllipticSigner) {
          value = new TextEncoder('utf-8').encode(mockedReturns);
          bufferSize += value.byteLength;
          valueArray.push(value);
          return
        }

        bufferSize += value.byteLength;
        valueArray.push(value)
      });

      const buffer = new Uint8Array(bufferSize);
      let offset = 0;
      valueArray.forEach((value) => {
        if (value instanceof EllipticSigner) {
          buffer.set(value, offset);
        } else {
          buffer.set(value, offset);
          offset += value.byteLength;
        }
      });

      return buffer
    }

    describe('getCertificateRegistrationRequest', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedProperties = {
          mockedCertHolderId: clientProperties['scalar.dl.client.cert_holder_id'],
          mockedCertVersion: clientProperties['scalar.dl.client.cert_version'],
          mockedCertPem: clientProperties['scalar.dl.client.cert_pem'],
        };
        const mockedBuffer = genericBufferArrayGenerator(mockedProperties);

        // act
        const binaryArray = await grpcMessageGetter.getCertificateRegistrationRequest();

        // assert
        assert.deepEqual(binaryArray, mockedBuffer);
      });
    });

    describe('getFunctionRegistrationRequest', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedFunctionId = 1234;
        const mockedFunctionBinaryName = 'mockedFunctionBinaryName';
        const mockedFunctionBytes = new Uint8Array([1, 2, 3]);
        const mockedProperties = {
          mockedFunctionId: mockedFunctionId,
          mockedFunctionBinaryName: mockedFunctionBinaryName,
          mockedFunctionBytes: mockedFunctionBytes,
        };

        const mockedBuffer = genericBufferArrayGenerator(mockedProperties);

        // act
        const binaryArray = await grpcMessageGetter.getFunctionRegistrationRequest(
            mockedFunctionId, mockedFunctionBinaryName, mockedFunctionBytes);

        // assert
        assert.deepEqual(binaryArray, mockedBuffer);
      });
    });

    describe('getContractRegistrationRequest', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedContractId = 1234;
        const mockedContractBinaryName = 'mockedFunctionBinaryName';
        const mockedContractBytesCode = new Uint8Array([1, 2, 3]);
        const mockedContractProperties = {
          A: 'a',
          B: 'b'
        };
        const mockedSignature = new EllipticSigner(
            clientProperties['scalar.dl.client.private_key_pem']);
        const mockedProperties = {
          mockedContractId: mockedContractId,
          mockedContractBinaryName: mockedContractBinaryName,
          mockedContractBytesCode: mockedContractBytesCode,
          mockedContractProperties: mockedContractProperties,
          certHolderId: clientProperties['scalar.dl.client.cert_holder_id'],
          certVersion: clientProperties['scalar.dl.client.cert_version'],
          mockedSignature: mockedSignature,
        };
        const mockedBuffer = genericBufferArrayGenerator(mockedProperties);

        genericEllipticSignatureSigner(grpcMessageGetter);

        // act
        const binaryArray = await grpcMessageGetter.getContractRegistrationRequest(
            mockedContractId, mockedContractBinaryName, mockedContractBytesCode,
            mockedContractProperties);

        // assert
        assert.deepEqual(binaryArray, mockedBuffer);
      });
    });

    describe('getContractListingRequest', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedContractId = 1234;
        const mockedSignature = new EllipticSigner(
            clientProperties['scalar.dl.client.private_key_pem']);
        const mockedProperties = {
          certHolderId: clientProperties['scalar.dl.client.cert_holder_id'],
          certVersion: clientProperties['scalar.dl.client.cert_version'],
          mockedContractId: mockedContractId,
          mockedSignature: mockedSignature,
        };
        const mockedBuffer = genericBufferArrayGenerator(mockedProperties);

        genericEllipticSignatureSigner(grpcMessageGetter);

        // act
        const binaryArray = await grpcMessageGetter.getContractListingRequest(
            mockedContractId);

        // assert
        assert.deepEqual(binaryArray, mockedBuffer);
      });
    });

    describe('getContractExecutionRequest', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedContractId = 1234;
        const mockedContractArgument = {
          A: 'a',
          B: 'b'
        };
        const mockedFunctionArgument = {
          C: 'c',
          D: 'd'
        };
        const mockedSignature = new EllipticSigner(
            clientProperties['scalar.dl.client.private_key_pem']);
        const mockedProperties = {
          mockedContractId: mockedContractId,
          mockedContractArgument: mockedContractArgument,
          certHolderId: clientProperties['scalar.dl.client.cert_holder_id'],
          certVersion: clientProperties['scalar.dl.client.cert_version'],
          mockedFunctionArgument: mockedFunctionArgument,
          mockedSignature: mockedSignature,

        };
        const mockedBuffer = genericBufferArrayGenerator(mockedProperties);

        genericEllipticSignatureSigner(grpcMessageGetter);

        // act
        const binaryArray = await grpcMessageGetter.getContractExecutionRequest(
            mockedContractId, mockedContractArgument, mockedFunctionArgument);

        // assert
        assert.deepEqual(binaryArray, mockedBuffer);
      });
    });

    describe('getLedgerValidationRequest', () => {
      it('should work as expected', async () => {
        // prepare
        const mockedAssetId = 1234;
        const mockedSignature = new EllipticSigner(
            clientProperties['scalar.dl.client.private_key_pem']);
        const mockedProperties = {
          mockedAssetId: mockedAssetId,
          certHolderId: clientProperties['scalar.dl.client.cert_holder_id'],
          certVersion: clientProperties['scalar.dl.client.cert_version'],
          mockedSignature: mockedSignature,
        };
        const mockedBuffer = genericBufferArrayGenerator(mockedProperties);

        genericEllipticSignatureSigner(grpcMessageGetter);

        // act
        const binaryArray = await grpcMessageGetter.getLedgerValidationRequest(
            mockedAssetId);

        // assert
        assert.deepEqual(binaryArray, mockedBuffer);
      });
    });
  });
});
