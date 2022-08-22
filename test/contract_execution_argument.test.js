/* eslint-disable max-len */
const {
  format,
} = require('../contract_execution_argument');

test('if format works properly', () => {
  expect(format('nonce', ['f1', 'f2'], 'stringArgument')).toEqual(
      'V2\u0001nonce\u0003f1\u0002f2\u0003stringArgument',
  );

  expect(format('nonce', ['f1', 'f2'], {foo: 'bar'})).toEqual(
      'V2\u0001nonce\u0003f1\u0002f2\u0003{"foo":"bar"}',
  );

  expect(
      format('nonce', ['f1', null, undefined, {}, 'f2'], {foo: 'bar'}),
  ).toEqual('V2\u0001nonce\u0003f1\u0002f2\u0003{"foo":"bar"}');
});

test('if format can throw error', () => {
  expect(() => format('nonce', ['f1', 'f2'], 1)).toThrowError(
      'argument must be a string or an object',
  );

  expect(() => format(0, ['f1', 'f2'], 'stringArgument')).toThrowError(
      'nonce must be a string',
  );

  expect(() => format('nonce', {}, 'stringArgument')).toThrowError(
      'functionIds must be an array',
  );
});
