const {ContractExecutionResult} = require('..');
const {AssetProof} = require('..');

const mockedResponse = {
  getContractresult: () => 'contract_result',
  getFunctionresult: () => 'function_result',
  getProofsList: () => [
    {
      getAssetId: () => 'foo',
      getAge: () => 1,
      getHash_asU8: () => new Uint8Array([0, 0, 0]),
      getPrevHash_asU8: () => new Uint8Array([0, 0, 0]),
      getNonce: () => 'nonce',
      getInput: () => 'input',
      getSignature_asU8: () => new Uint8Array([1, 2, 3]),
    },
  ],
};

jest.spyOn(mockedResponse, 'getContractresult');
jest.spyOn(mockedResponse, 'getFunctionresult');
jest.spyOn(mockedResponse, 'getProofsList');

afterEach(() => {
  jest.restoreAllMocks();
});

test('if fromGrpcContractExecutionResponse works', () => {
  ContractExecutionResult.fromGrpcContractExecutionResponse(mockedResponse);
  expect(mockedResponse.getContractresult).toBeCalledTimes(1);
  expect(mockedResponse.getFunctionresult).toBeCalledTimes(1);
  expect(mockedResponse.getProofsList).toBeCalledTimes(1);
});

test('', () => {
  const result = new ContractExecutionResult(
      '{"foo": "bar"}',
      'function_result',
      [
        new AssetProof(
            'foo',
            1,
            'nonce',
            'input',
            new Uint8Array([0, 0, 0]),
            new Uint8Array([0, 0, 0]),
            new Uint8Array([1, 2, 3]),
        ),
      ],
      [
        new AssetProof(
            'foo',
            1,
            'nonce',
            'input',
            new Uint8Array([0, 0, 0]),
            new Uint8Array([0, 0, 0]),
            new Uint8Array([9, 9, 9]),
        ),
      ],
  );

  expect(result.getContractResult()).toEqual('{"foo": "bar"}');
  expect(result.getFunctionResult()).toEqual('function_result');
  expect(result.getResult()).toEqual({foo: 'bar'});
  expect(result.getProofs()[0].getSignature()).toEqual(
      new Uint8Array([1, 2, 3]),
  );
  expect(result.getLedgerProofs()[0].getSignature()).toEqual(
      new Uint8Array([1, 2, 3]),
  );
  expect(result.getAuditorProofs()[0].getSignature()).toEqual(
      new Uint8Array([9, 9, 9]),
  );
});
