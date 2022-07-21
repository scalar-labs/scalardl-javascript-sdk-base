/* eslint-disable max-len */
const {
  ClientServiceBase,
  StatusCode,
  ClientError,
  ContractExecutionResult,
  LedgerValidationResult,
} = require('..');

const protobuf = {};
const services = {
  ledgerPrivileged: {},
  ledgerClient: {},
};

const clientProperties = {
  'scalar.dl.client.private_key_pem':
    '-----BEGIN EC PRIVATE KEY-----\n' +
    'MHcCAQEEICcJGMEw3dyXUGFu/5a36HqY0ynZi9gLUfKgYWMYgr/IoAoGCCqGSM49\n' +
    'AwEHoUQDQgAEBGuhqumyh7BVNqcNKAQQipDGooUpURve2dO66pQCgjtSfu7lJV20\n' +
    'XYWdrgo0Y3eXEhvK0lsURO9N0nrPiQWT4A==\n-----END EC PRIVATE KEY-----\n',
  'scalar.dl.client.cert_pem':
    '-----BEGIN CERTIFICATE-----\n' +
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

// afterEach(function() {
//   sinon.restore();
// });

describe('registerCertificate', () => {
  test('should throw error when some properties are not provied', async () => {
    const clientServiceBase = new ClientServiceBase(
        {}, // service
        null, // protobuf
        {}, // properties
    );
    await expect(
        clientServiceBase.registerCertificate(),
    ).rejects.toThrowError();
  });

  test('should work as expected', async () => {
    // prepare
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
    const mockSpySetCertHolderId = jest.spyOn(
        mockedCertificateRegistrationRequest,
        'setCertHolderId',
    );
    const mockSpySetCertVersion = jest.spyOn(
        mockedCertificateRegistrationRequest,
        'setCertVersion',
    );
    const mockSpySetCertPem = jest.spyOn(
        mockedCertificateRegistrationRequest,
        'setCertPem',
    );

    // act
    const response = await clientServiceBase.registerCertificate();

    // assert
    expect(mockSpySetCertHolderId).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_holder_id'],
    );
    expect(mockSpySetCertVersion).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_version'],
    );
    expect(mockSpySetCertPem).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_pem'],
    );
    expect(response).toBeUndefined();
  });
});

describe('registerFunction', () => {
  test('should throw an error when contractBytes is not a Uint8Array', async () => {
    // prepare
    const clientServiceBase = new ClientServiceBase(
        services,
        protobuf,
        clientProperties,
    );

    // act assert
    try {
      await clientServiceBase.registerFunction('contract1', 'foo', 'wrongType');
    } catch (e) {
      expect(e).toBeInstanceOf(ClientError);
    }
  });

  test('should work as expected', async () => {
    // prepare
    const mockedContractId = '12345';
    const mockedName = 'foo';
    const mockedByteCode = new Uint8Array([1, 2, 3]);
    const mockedFunctionRegistrationRequest = {
      setFunctionId: function() {},
      setFunctionBinaryName: function() {},
      setFunctionByteCode: function() {},
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
    const mockSpyFunctionRegistrationRequest = jest.spyOn(
        mockedProtobuf,
        'FunctionRegistrationRequest',
    );
    const mockSpySetFunctionId = jest.spyOn(
        mockedFunctionRegistrationRequest,
        'setFunctionId',
    );
    const mockSpySetFunctionBinaryName = jest.spyOn(
        mockedFunctionRegistrationRequest,
        'setFunctionBinaryName',
    );
    const mockSpySetFunctionByteCode = jest.spyOn(
        mockedFunctionRegistrationRequest,
        'setFunctionByteCode',
    );

    // act
    const response = await clientServiceBase.registerFunction(
        mockedContractId,
        mockedName,
        mockedByteCode,
        clientProperties,
    );

    // assert
    expect(mockSpyFunctionRegistrationRequest).toBeCalledTimes(1);
    expect(mockSpySetFunctionId).toBeCalledWith(mockedContractId);
    expect(mockSpySetFunctionBinaryName).toBeCalledWith(mockedName);
    expect(mockSpySetFunctionByteCode).toBeCalledWith(mockedByteCode);
    expect(response).toBeUndefined();
  });
});

describe('registerContract', () => {
  test('should throw error when some properties are not provied', async () => {
    const clientServiceBase = new ClientServiceBase(
        {}, // service
        null, // protobuf
        {}, // properties
    );
    await expect(
        clientServiceBase.registerContract('contract1', 'foo', 'wrongType'),
    ).rejects.toThrowError();
  });

  test('should throw an error when contractBytes is not a Uint8Array', async () => {
    // prepare
    const clientServiceBase = new ClientServiceBase(
        services,
        protobuf,
        clientProperties,
    );

    // act assert
    try {
      await clientServiceBase.registerContract('contract1', 'foo', 'wrongType');
    } catch (e) {
      expect(e).toBeInstanceOf(ClientError);
    }
  });

  test('should work as expected', async () => {
    // prepare
    const mockedContractId = '12345';
    const mockedName = 'foo';
    const mockedByteCode = new Uint8Array([1, 2, 3]);
    const mockedPropertiesJson = JSON.stringify(clientProperties);
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
    const mockedSigner = {
      sign: function() {},
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
    const mockSpyContractRegistrationRequest = jest.spyOn(
        mockedProtobuf,
        'ContractRegistrationRequest',
    );
    const mockSpySetContractBinaryName = jest.spyOn(
        mockedContractRegistrationRequest,
        'setContractBinaryName',
    );
    const mockSpySetContractId = jest.spyOn(
        mockedContractRegistrationRequest,
        'setContractId',
    );
    const mockSpySetContractByteCode = jest.spyOn(
        mockedContractRegistrationRequest,
        'setContractByteCode',
    );
    const mockSpySetContractProperties = jest.spyOn(
        mockedContractRegistrationRequest,
        'setContractProperties',
    );
    const mockSpySetCertHolderId = jest.spyOn(
        mockedContractRegistrationRequest,
        'setCertHolderId',
    );
    const mockSpySetCertVersion = jest.spyOn(
        mockedContractRegistrationRequest,
        'setCertVersion',
    );
    const mockSpySetSignature = jest.spyOn(
        mockedContractRegistrationRequest,
        'setSignature',
    );
    const mockSpySign = jest.spyOn(mockedSigner, 'sign');

    // act
    const response = await clientServiceBase.registerContract(
        mockedContractId,
        mockedName,
        mockedByteCode,
        clientProperties,
    );

    // assert
    expect(mockSpySetContractId).toBeCalledWith(mockedContractId);
    expect(mockSpyContractRegistrationRequest).toBeCalledTimes(1);
    expect(mockSpySetContractBinaryName).toBeCalledWith(mockedName);
    expect(mockSpySetContractByteCode).toBeCalledWith(mockedByteCode);
    expect(mockSpySetContractProperties).toBeCalledWith(mockedPropertiesJson);
    expect(mockSpySetCertHolderId).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_holder_id'],
    );
    expect(mockSpySetCertVersion).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_version'],
    );
    expect(mockSpySetSignature).toBeCalledTimes(1);
    expect(mockSpySign).toBeCalledTimes(1);
    expect(response).toBeUndefined();
  });
});

describe('listContract', () => {
  test('should throw error when some properties are not provied', async () => {
    const clientServiceBase = new ClientServiceBase(
        {}, // service
        null, // protobuf
        {}, // properties
    );
    await expect(
        clientServiceBase.registerContract('whatever'),
    ).rejects.toThrowError();
  });

  test('should work as expected', async () => {
    // prepare
    const mockedContractId = '12345';
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
    const mockedSigner = {
      sign: function() {},
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
    const mockSpyContractsListingRequest = jest.spyOn(
        mockedProtobuf,
        'ContractsListingRequest',
    );
    const mockSpySetCertHolderId = jest.spyOn(
        mockedListContracts,
        'setCertHolderId',
    );
    const mockSpySetCertVersion = jest.spyOn(
        mockedListContracts,
        'setCertVersion',
    );
    const mockSpySetContractId = jest.spyOn(
        mockedListContracts,
        'setContractId',
    );
    const mockSpySetSignature = jest.spyOn(mockedListContracts, 'setSignature');
    const mockSpySign = jest.spyOn(mockedSigner, 'sign');

    // act
    const response = await clientServiceBase.listContracts(mockedContractId);

    // assert
    expect(mockSpyContractsListingRequest).toBeCalledTimes(1);
    expect(mockSpySetCertHolderId).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_holder_id'],
    );
    expect(mockSpySetCertVersion).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_version'],
    );
    expect(mockSpySetContractId).toBeCalledWith(mockedContractId);
    expect(mockSpySetSignature).toBeCalledTimes(1);
    expect(mockSpySign).toBeCalledTimes(1);
    expect(response).toBeInstanceOf(Object);
  });
});

describe('validateLedger', () => {
  test('should throw error when some properties are not provided', async () => {
    const clientServiceBase = new ClientServiceBase(
        {}, // service
        null, // protobuf
        {}, // properties
    );
    await expect(
        clientServiceBase.validateLedger('whatever'),
    ).rejects.toThrowError();
  });

  test('should throw an error when startAge is not valid', async () => {
    const clientServiceBase = new ClientServiceBase(
        {}, // service
        null, // protobuf
        {}, // properties
    );
    await expect(
        clientServiceBase.validateLedger('whatever', -1, 3),
    ).rejects.toThrowError();
  });

  test('should throw an error when endAge is not valid', async () => {
    const clientServiceBase = new ClientServiceBase(
        {}, // service
        null, // protobuf
        {}, // properties
    );
    await expect(
        clientServiceBase.validateLedger('whatever', 0, 100000000000000000),
    ).rejects.toThrowError();
  });

  test('should throw an error when endAge is inferior to startAge', async () => {
    const clientServiceBase = new ClientServiceBase(
        {}, // service
        null, // protobuf
        {}, // properties
    );
    await expect(
        clientServiceBase.validateLedger('whatever', 3, 2),
    ).rejects.toThrowError();
  });

  const mockedAssetId = 'contractId';
  test('should work as expected', async () => {
    // prepare
    const mockedValidateLedger = {
      setAssetId: function() {},
      setStartAge: function() {},
      setEndAge: function() {},
      setCertHolderId: function() {},
      setCertVersion: function() {},
      setSignature: function() {},
    };
    const mockedProtobuf = {
      LedgerValidationRequest: function() {
        return mockedValidateLedger;
      },
    };
    const mockedSigner = {
      sign: function() {},
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
    const mockSpyLedgerValidationRequest = jest.spyOn(
        mockedProtobuf,
        'LedgerValidationRequest',
    );
    const mockSpySetAssetId = jest.spyOn(mockedValidateLedger, 'setAssetId');
    const mockSpySetCertHolderId = jest.spyOn(
        mockedValidateLedger,
        'setCertHolderId',
    );
    const mockSpySetCertVersion = jest.spyOn(
        mockedValidateLedger,
        'setCertVersion',
    );
    const mockSpySetSignature = jest.spyOn(
        mockedValidateLedger,
        'setSignature',
    );
    const mockSpySign = jest.spyOn(mockedSigner, 'sign');

    // act
    const response = await clientServiceBase.validateLedger(mockedAssetId);

    // assert
    expect(mockSpyLedgerValidationRequest).toBeCalledTimes(1);
    expect(mockSpySetAssetId).toBeCalledWith(mockedAssetId);
    expect(mockSpySetCertHolderId).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_holder_id'],
    );
    expect(mockSpySetCertVersion).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_version'],
    );
    expect(mockSpySetSignature).toBeCalledTimes(1);
    expect(mockSpySign).toBeCalledTimes(1);
    expect(response).toBeInstanceOf(LedgerValidationResult);

    const assetProof = response.getProof();
    expect(assetProof.getId()).toEqual('asset-id');
    expect(assetProof.getAge()).toEqual(1);
    expect(assetProof.getHash()).toEqual(new Uint8Array([1, 2, 3]));
    expect(assetProof.getNonce()).toEqual('nonce');
    expect(assetProof.getSignature()).toEqual(new Uint8Array());
  });
});

describe('executeContract', () => {
  test('should throw error when some properties are not provied', async () => {
    const clientServiceBase = new ClientServiceBase(
        {}, // service
        null, // protobuf
        {}, // properties
    );
    await expect(
        clientServiceBase.executeContract('id', {}, {}),
    ).rejects.toThrowError();
  });

  // prepare
  const mockedContractId = '12345';
  const mockedArgument = {mocked: 'argument'};
  const mockedFunctionArgument = 'mockedFunctionArgument';
  const mockedFunctionArgumentJson = JSON.stringify(mockedFunctionArgument);
  test('should work as expected', async () => {
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
    const mockedSigner = {
      sign: function() {},
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
        clientProperties,
    );
    const mockSpyContractExecutionRequest = jest.spyOn(
        mockedProtobuf,
        'ContractExecutionRequest',
    );
    const mockSpySetContractId = jest.spyOn(
        mockedExecuteContract,
        'setContractId',
    );
    const mockSpySetContractArgument = jest.spyOn(
        mockedExecuteContract,
        'setContractArgument',
    );
    const mockSpySetCertHolderId = jest.spyOn(
        mockedExecuteContract,
        'setCertHolderId',
    );
    const mockSpySetCertVersion = jest.spyOn(
        mockedExecuteContract,
        'setCertVersion',
    );
    const mockSpySetFunctionArgument = jest.spyOn(
        mockedExecuteContract,
        'setFunctionArgument',
    );
    const mockSpySetSignature = jest.spyOn(
        mockedExecuteContract,
        'setSignature',
    );
    const mockSpySign = jest.spyOn(mockedSigner, 'sign');

    // act
    const response = await clientServiceBase.executeContract(
        mockedContractId,
        mockedArgument,
        mockedFunctionArgument,
    );

    // assert
    expect(mockSpyContractExecutionRequest).toBeCalledTimes(1);
    expect(mockSpySetContractId).toBeCalledWith(mockedContractId);
    expect(mockSpySetContractArgument).toBeCalledWith(
        expect.stringContaining('argument'),
    );
    expect(mockSpySetContractArgument).toBeCalledWith(
        expect.stringContaining('nonce'),
    );
    expect(mockSpySetCertHolderId).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_holder_id'],
    );
    expect(mockSpySetCertVersion).toBeCalledWith(
        clientProperties['scalar.dl.client.cert_version'],
    );
    expect(mockSpySetSignature).toBeCalledTimes(1);
    expect(mockSpySign).toBeCalledTimes(1);
    expect(mockSpySetFunctionArgument).toBeCalledWith(
        mockedFunctionArgumentJson,
    );

    expect(response).toBeInstanceOf(ContractExecutionResult);

    const assetProof = response.getProofs()[0];
    expect(assetProof.getId()).toEqual('asset-id');
    expect(assetProof.getAge()).toEqual(1);
    expect(assetProof.getHash()).toEqual(new Uint8Array());
    expect(assetProof.getNonce()).toEqual('nonce');
    expect(assetProof.getSignature()).toEqual(new Uint8Array([1, 2, 3]));
  });
});

describe('_executePromise', () => {
  test('should parse and rethrow error on Node.js environment', async () => {
    const status = {code: 404, message: 'foo message'};
    const toObject = jest.fn(() => status);
    const GrpcStatusObject = {toObject: toObject};
    const deserializeBinaryStub = jest.fn(() => GrpcStatusObject);
    const GrpcStatus = {deserializeBinary: deserializeBinaryStub};
    const protobuf = {Status: GrpcStatus};
    const clientServiceBase = new ClientServiceBase(
        services,
        protobuf,
        clientProperties,
    );
    clientServiceBase._isNodeJsRuntime = jest.fn(() => true);
    const binaryStatus = [status];
    const errorStub = new Error();
    const metadataStub = {
      get: jest.fn(() => binaryStatus),
    };
    errorStub.metadata = metadataStub;

    try {
      const promise = new Promise((resolve, reject) => {
        throw errorStub;
      });
      await clientServiceBase._executePromise(promise);
    } catch (e) {
      expect(e.constructor.name).toEqual('ClientError');
      expect(e.code).toEqual(status.code);
      expect(e.message).toEqual(status.message);
    }
  });

  test('should parse and rethrow error on browser environment', async () => {
    const status = {code: 404, message: 'foo message'};
    const toObject = jest.fn(() => status);
    const GrpcStatusObject = {toObject: toObject};
    const deserializeBinaryStub = jest.fn(() => GrpcStatusObject);
    const GrpcStatus = {deserializeBinary: deserializeBinaryStub};
    const protobuf = {Status: GrpcStatus};
    const clientServiceBase = new ClientServiceBase(
        services,
        protobuf,
        clientProperties,
    );
    clientServiceBase._isNodeJsRuntime = jest.fn(() => false);
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
      expect(e.constructor.name).toEqual('ClientError');
      expect(e.code).toEqual(status.code);
      expect(e.message).toEqual(status.message);
    }
  });

  it('should rethrow error when there is no error status', async () => {
    const clientServiceBase = new ClientServiceBase(
        services,
        protobuf,
        clientProperties,
    );
    clientServiceBase._isNodeJsRuntime = jest.fn(() => false);
    const errorStub = new Error('bar message');
    errorStub.metadata = {};
    try {
      const promise = new Promise((resove, reject) => {
        throw errorStub;
      });
      await clientServiceBase._executePromise(promise);
    } catch (e) {
      expect(e.constructor.name).toEqual('ClientError');
      expect(e.code).toEqual(StatusCode.UNKNOWN_TRANSACTION_STATUS);
      expect(e.message).toEqual(errorStub.message);
    }
  });
});

describe('validateLedger linearizably', () => {
  test('should work as expected', async () => {
    // prepare
    const mockedSigner = {
      sign: function() {},
    };

    const spiedSetContractArgument = jest.fn();

    const mockedProtobuf = {
      ContractExecutionRequest: () => ({
        setContractId: function() {},
        setContractArgument: spiedSetContractArgument,
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
          getProofsList: () => [
            {
              getAssetId: () => 'foo',
              getAge: () => 1,
              getHash_asU8: () => new Uint8Array([0, 0, 0]),
              getNonce: () => 'nonce',
              getSignature_asU8: () => new Uint8Array([1, 2, 3]),
            },
          ],
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
          getProofsList: () => [
            {
              getAssetId: () => 'foo',
              getAge: () => 1,
              getHash_asU8: () => new Uint8Array([0, 0, 0]),
              getNonce: () => 'nonce',
              getSignature_asU8: () => new Uint8Array([1, 2, 3]),
            },
          ],
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

    const spiedContractExecutionRequest = jest.spyOn(
        mockedProtobuf,
        'ContractExecutionRequest',
    );

    const spiedExecuteContract = jest.spyOn(
        mockedLedgerClient,
        'executeContract',
    );

    const spiedOrderExecution = jest.spyOn(
        mockedAuditorClient,
        'orderExecution',
    );

    const spiedValidateExecution = jest.spyOn(
        mockedAuditorClient,
        'validateExecution',
    );

    const spiedExecutionValidationRequest = jest.spyOn(
        mockedProtobuf,
        'ExecutionValidationRequest',
    );

    const spiedSign = jest.spyOn(mockedSigner, 'sign');

    // act
    const response = await clientServiceBase.validateLedger('foo');

    // assert
    expect(spiedContractExecutionRequest).toBeCalledTimes(1);
    expect(spiedExecutionValidationRequest).toBeCalledTimes(1);
    expect(spiedExecuteContract).toBeCalledTimes(1);
    expect(spiedOrderExecution).toBeCalledTimes(1);
    expect(spiedValidateExecution).toBeCalledTimes(1);
    expect(spiedSign).toBeCalledTimes(1);

    expect(spiedSetContractArgument).toBeCalledWith(
        expect.stringContaining('start_age'),
    );
    expect(spiedSetContractArgument).toBeCalledWith(
        expect.stringContaining('end_age'),
    );

    expect(response).toBeInstanceOf(LedgerValidationResult);

    const ledgerProof = response.getProof();
    const auditorProof = response.getAuditorProof();

    expect(ledgerProof.getId()).toEqual('foo');
    expect(ledgerProof.getAge()).toEqual(1);
    expect(ledgerProof.getHash()).toEqual(new Uint8Array([0, 0, 0]));
    expect(ledgerProof.getNonce()).toEqual('nonce');
    expect(ledgerProof.getSignature()).toEqual(new Uint8Array([1, 2, 3]));

    expect(auditorProof.getId()).toEqual('foo');
    expect(auditorProof.getAge()).toEqual(1);
    expect(auditorProof.getHash()).toEqual(new Uint8Array([0, 0, 0]));
    expect(auditorProof.getNonce()).toEqual('nonce');
    expect(auditorProof.getSignature()).toEqual(new Uint8Array([1, 2, 3]));
  });
});
