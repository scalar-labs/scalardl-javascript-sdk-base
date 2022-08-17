/* eslint-disable max-len */
const {
  format,
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
