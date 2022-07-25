/* eslint-disable max-len */
const {
  format,
  formatDeprecated,
  getFunctionIds,
} = require('../contract_execution_argument');

test('if format works properly', () => {
  expect(format('stringArgument', 'nonce', ['f1', 'f2'])).toEqual(
      'V2\u0001nonce\u0003f1\u0002f2\u0003stringArgument',
  );

  expect(format({foo: 'bar'}, 'nonce', ['f1', 'f2'])).toEqual(
      'V2\u0001nonce\u0003f1\u0002f2\u0003{"foo":"bar"}',
  );

  expect(
      format({foo: 'bar'}, 'nonce', ['f1', null, undefined, {}, 'f2']),
  ).toEqual('V2\u0001nonce\u0003f1\u0002f2\u0003{"foo":"bar"}');
});

test('if format can throw error', () => {
  expect(() => format(1, 'nonce', ['f1', 'f2'])).toThrowError(
      'argument must be a string or an object',
  );

  expect(() => format('stringArgument', 0, ['f1', 'f2'])).toThrowError(
      'nonce must be a string',
  );

  expect(() => format('stringArgument', 'nonce', {})).toThrowError(
      'functionIds must be an array',
  );
});

test('if formatDeprecated works properly', () => {
  expect(formatDeprecated({foo: 'bar'}, 'nonce')).toEqual(
      '{"foo":"bar","nonce":"nonce"}',
  );
});

test('if formatDeprecated can throw errors', () => {
  expect(() => formatDeprecated('string', 'nonce')).toThrowError(
      'argument must be an object',
  );

  expect(() => formatDeprecated({foo: 'bar'}, 0)).toThrowError(
      'nonce must be a string',
  );
});

test('if getFunctionIds works properly', () => {
  expect(getFunctionIds({foo: 'bar'})).toEqual([]);

  expect(getFunctionIds({_functions_: ['f1', 'f2']})).toEqual(['f1', 'f2']);
});

test('if getFunctionIds can throw error', () => {
  expect(() => getFunctionIds(1)).toThrowError('argument must be an object');
  expect(() => getFunctionIds({_functions_: 'not-array'})).toThrowError(
      'argument._functions_ must be an array',
  );
});
