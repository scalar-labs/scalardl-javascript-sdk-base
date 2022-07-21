const {TextEncoder} = require('../polyfill/text_encoder.js');

test('if TextEncoder can encode the `hello world` string', () => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode('hello world');

  expect(encoded).toEqual(
      new Uint8Array([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]),
  );
});

test('if TextEncoder can encode the empty string', () => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode('');

  expect(encoded).toEqual(
      new Uint8Array(),
  );
});
