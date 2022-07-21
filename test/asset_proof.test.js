const {AssetProof} = require('../asset_proof');

test('if getters works properly', () => {
  const proof = new AssetProof(
      'foo',
      1,
      'nonce',
      'input',
      new Uint8Array([1, 2, 3, 4]),
      new Uint8Array([5, 6, 7, 8]),
      new Uint8Array([9, 10, 11, 12]),
  );

  expect(proof.getId()).toEqual('foo');
  expect(proof.getAge()).toEqual(1);
  expect(proof.getNonce()).toEqual('nonce');
  expect(proof.getInput()).toEqual('input');
  expect(proof.getHash()).toEqual(new Uint8Array([1, 2, 3, 4]));
  expect(proof.getPrevHash()).toEqual(new Uint8Array([5, 6, 7, 8]));
  expect(proof.getSignature()).toEqual(new Uint8Array([9, 10, 11, 12]));
});

test('if validateWith works as expected', () => {
  const proof = new AssetProof(
      'foo',
      1,
      'nonce',
      'input',
      new Uint8Array([1, 2, 3, 4]),
      new Uint8Array([5, 6, 7, 8]),
      new Uint8Array([9, 10, 11, 12]),
  );

  const mockedValidator = {
    validate: jest.fn(() => true),
  };

  expect(() => proof.validateWith(mockedValidator)).not.toThrow();

  mockedValidator.validate.mockReturnValueOnce(false);

  expect(() => proof.validateWith(mockedValidator)).toThrow(
      'The proof signature can\'t be validated with the certificate.',
  );
});

test('if toString works as expected', () => {
  const proof = new AssetProof(
      'foo',
      1,
      'nonce',
      'input',
      new Uint8Array([1, 2, 3, 4]),
      new Uint8Array([5, 6, 7, 8]),
      new Uint8Array([9, 10, 11, 12]),
  );

  expect(proof.toString()).toEqual(
      // eslint-disable-next-line max-len
      'AssetProof{id=foo,age=1,hash=1,2,3,4,nonce=nonce,input=input,hash=AQIDBA==,prev_hash=BQYHCA==,signature=CQoLDA==}',
  );
});

test('if hashEquals works as expected', () => {
  const proof = new AssetProof(
      'foo',
      1,
      'nonce',
      'input',
      new Uint8Array([1, 2, 3, 4]),
      new Uint8Array([5, 6, 7, 8]),
      new Uint8Array([9, 10, 11, 12]),
  );

  expect(proof.hashEquals(new Uint8Array([1, 2, 3, 4]))).toBe(true);
});

test('if valueEquals works as expected', () => {
  const proof = new AssetProof(
      'foo',
      1,
      'nonce',
      'input',
      new Uint8Array([1, 2, 3, 4]),
      new Uint8Array([5, 6, 7, 8]),
      new Uint8Array([9, 10, 11, 12]),
  );

  expect(proof.valueEquals({})).toBe(false);
  expect(proof.valueEquals(new AssetProof())).toBe(false);
  expect(
      proof.valueEquals(
          new AssetProof(
              'foo',
              1,
              'nonce',
              'input',
              new Uint8Array([1, 2, 3, 4]),
              new Uint8Array([5, 6, 7, 8]),
              new Uint8Array([0]), // even different signature
          ),
      ),
  ).toBe(true);
});
