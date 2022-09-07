/* eslint-disable max-len */
const {btoa} = require('../polyfill/btoa.js');

test('if btoa can convert string into base64 string', () => {
  expect(btoa('hello')).toEqual('aGVsbG8='); // with padding
  expect(btoa('abc')).toEqual('YWJj'); // without padding
});

test('if btoa can throw an error if string contains characters outside of the Latin1 range.', () => {
  expect(() => btoa('あ')).toThrow(
      'The string contains characters outside of the Latin1 range.',
  );
});
