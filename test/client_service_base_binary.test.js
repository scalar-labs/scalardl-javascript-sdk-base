/* eslint-disable max-len */
const {ClientServiceBase} = require('..');

const mockedContractExecutionRequest = {
  setContractId: function() {},
  setContractArgument: function() {},
  setCertHolderId: function() {},
  setCertVersion: function() {},
  setFunctionArgument: function() {},
  setSignature: function() {},
  setAuditorSignature: function() {},
  setUseFunctionIds: function() {},
  setFunctionIdsList: function() {},
  setNonce: function() {},
  serializeBinary: function() {},
};

const protobuf = {
  ContractExecutionRequest: function() {
    return mockedContractExecutionRequest;
  },
};

const services = {
  signerFactory: {
    create: () => ({sign: function() {}}),
  },
};
const properties = {
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

test('createSerializedContractExecutionRequest passes parameters properly', async () => {
  // Arrange;
  const base = new ClientServiceBase(services, protobuf, properties);
  const spied1 = jest.spyOn(mockedContractExecutionRequest, 'setContractId');
  const spied2 = jest.spyOn(
      mockedContractExecutionRequest,
      'setContractArgument',
  );
  const spied3 = jest.spyOn(
      mockedContractExecutionRequest,
      'setFunctionArgument',
  );

  // Action;
  await base.createSerializedContractExecutionRequest(
      'contract-id',
      {'contract-argument-1': 'a'},
      {'function-argument-1': 'b'},
  );

  // Assert
  expect(spied1).toBeCalledWith('contract-id');
  expect(spied2).toBeCalledWith(
      expect.stringContaining('{"contract-argument-1":"a"}'),
  );
  expect(spied3).toBeCalledWith('{"function-argument-1":"b"}');
});

test('createSerializedExecutionRequest passes parameters properly', async () => {
  // Arrange;
  const base = new ClientServiceBase(services, protobuf, properties);
  const spied1 = jest.spyOn(mockedContractExecutionRequest, 'setContractId');
  const spied2 = jest.spyOn(mockedContractExecutionRequest, 'setFunctionIdsList');
  const spied3 = jest.spyOn(
      mockedContractExecutionRequest,
      'setContractArgument',
  );
  const spied4 = jest.spyOn(
      mockedContractExecutionRequest,
      'setFunctionArgument',
  );

  // Action;
  await base.createSerializedExecutionRequest(
      'contract-id',
      {'contract-argument-1': 'a'},
      'function-id',
      {'function-argument-1': 'b'},
      'nonce',
  );

  // Assert
  expect(spied1).toBeCalledWith('contract-id');
  expect(spied2).toBeCalledWith(['function-id']);
  expect(spied3).toBeCalledWith(
      expect.stringContaining('{"contract-argument-1":"a"}'),
  );
  expect(spied4).toBeCalledWith('{"function-argument-1":"b"}');
});

test('createSerializedExecutionRequest throws error when argument types are not the same', async () => {
  // Arrange;
  const base = new ClientServiceBase(services, protobuf, properties);

  // Action;

  // Assert
  await expect(base.createSerializedExecutionRequest(
      'contract-id',
      {'contract-argument-1': 'a'},
      'function-id',
      '{"function-argument-1":"b"}',
      'nonce',
  )).rejects.toThrowError('contract argument and function argument must be the same type');
});
