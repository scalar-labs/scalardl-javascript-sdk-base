/* eslint-disable max-len */
const {ClientProperties, ClientPropertiesField} = require('..');

test('should work normally', () => {
  const properties = new ClientProperties({
    'scalar.dl.client.cert_holder_id': 'foo',
    'scalar.dl.client.cert_version': 0,
  });

  expect(properties.getCertHolderId()).toEqual('foo');
  expect(properties.getCertVersion()).toEqual(0);
});

test('should work normal with allOf', () => {
  const properties = new ClientProperties(
      {
        'scalar.dl.client.cert_holder_id': 'foo',
        'scalar.dl.client.cert_version': 0,
      },
      [ClientPropertiesField.CERT_HOLDER_ID, ClientPropertiesField.CERT_VERSION],
  );
  expect(properties.getCertHolderId()).toEqual('foo');
  expect(properties.getCertVersion()).toEqual(0);
});

test('should throw errors when any property of allOf is not provided', () => {
  expect(() => {
    new ClientProperties({}, [ClientPropertiesField.CERT_HOLDER_ID]);
  }).toThrow(Error);
});

test('should work fine with oneOf', () => {
  const properties = new ClientProperties(
      {'scalar.dl.client.cert_holder_id': 'foo'},
      null,
      [ClientPropertiesField.CERT_HOLDER_ID, ClientPropertiesField.CERT_PEM],
  );
  expect(properties.getCertHolderId()).toEqual('foo');
});

test('should throw errorswhen more than one properties of oneOf are provided', () => {
  expect(
      () =>
        new ClientProperties(
            {
              'scalar.dl.client.cert_holder_id': 'foo',
              'scalar.dl.client.cert_version': 0,
            },
            null,
            [
              ClientPropertiesField.CERT_HOLDER_ID,
              ClientPropertiesField.CERT_VERSION,
            ],
        ),
  ).toThrow(Error);
});

test('should work fine with allOf and OneOf', () => {
  const properties = new ClientProperties(
      {
        'scalar.dl.client.cert_holder_id': 'foo',
        'scalar.dl.client.cert_version': 0,
        'scalar.dl.client.private_key_pem': 'pem',
      },
      [ClientPropertiesField.CERT_HOLDER_ID, ClientPropertiesField.CERT_VERSION], // allOf
      [
        ClientPropertiesField.PRIVATE_KEY_PEM,
        ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY,
      ], // oneOf
  );
  expect(properties.getCertHolderId()).toEqual('foo');
  expect(properties.getCertVersion()).toEqual(0);
  expect(properties.getPrivateKeyPem()).toEqual('pem');
});

test('should work fine with allOf and OneOf', () => {
  expect(
      () =>
        new ClientProperties(
            {
              'scalar.dl.client.cert_holder_id': 'foo',
              'scalar.dl.client.cert_version': 0,
              'scalar.dl.client.private_key_pem': 'pem',
              'scalar.dl.client.private_key_cryptokey': {},
            },
            [
              ClientPropertiesField.CERT_HOLDER_ID,
              ClientPropertiesField.CERT_VERSION,
            ], // allOf
            [
              ClientPropertiesField.PRIVATE_KEY_PEM,
              ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY,
            ], // oneOf
        ),
  ).toThrow(Error);
});

test('should set optional properties with default values', () => {
  const properties = new ClientProperties({}, [], []);

  expect(properties.getServerHost()).toEqual('localhost');
  expect(properties.getServerPort()).toEqual(50051);
  expect(properties.getServerPrivilegedPort()).toEqual(50052);
  expect(properties.getAuditorHost()).toEqual('localhost');
  expect(properties.getAuditorPort()).toEqual(40051);
  expect(properties.getAuditorPrivilegedPort()).toEqual(40052);
  expect(properties.getCertVersion()).toEqual(1);
  expect(properties.getTlsEnabled()).toEqual(false);
  expect(properties.getAuditorEnabled()).toEqual(false);
});

test('should overwrite default values of default properties', () => {
  const properties = new ClientProperties(
      {
        'scalar.dl.client.server.host': 'ledger.example.com',
        'scalar.dl.client.server.port': 80,
        'scalar.dl.client.server.privileged_port': 8080,
        'scalar.dl.client.auditor.host': 'auditor.example.com',
        'scalar.dl.client.auditor.port': 443,
        'scalar.dl.client.auditor.privileged_port': 4433,
        'scalar.dl.client.cert_version': 10,
        'scalar.dl.client.tls.enabled': true,
        'scalar.dl.client.auditor.enabled': true,
      },
      [],
      [],
  );

  expect(properties.getServerHost()).toEqual('ledger.example.com');
  expect(properties.getServerPort()).toEqual(80);
  expect(properties.getServerPrivilegedPort()).toEqual(8080);
  expect(properties.getAuditorHost()).toEqual('auditor.example.com');
  expect(properties.getAuditorPort()).toEqual(443);
  expect(properties.getAuditorPrivilegedPort()).toEqual(4433);
  expect(properties.getCertVersion()).toEqual(10);
  expect(properties.getTlsEnabled()).toEqual(true);
  expect(properties.getAuditorEnabled()).toEqual(true);
});

test('should have default linearizable properties', () => {
  const properties = new ClientProperties({}, [], []);
  expect(properties.getAuditorLinearizableValidationContractId()).toEqual(
      'validate-ledger',
  );
});

test('should be able to configure linearizable properties in auditor mode', () => {
  const properties = new ClientProperties(
      {
        'scalar.dl.client.auditor.enabled': true,
        'scalar.dl.client.auditor.linearizable_validation.contract_id': 'foo',
      },
      [],
      [],
  );
  expect(properties.getAuditorLinearizableValidationContractId()).toEqual(
      'foo',
  );
});

test(
    'should not be able to configure linearizable properties ' +
    'if it is not in auditor mode',
    () => {
      const properties = new ClientProperties(
          {
            'scalar.dl.client.auditor.enabled': false,
            'scalar.dl.client.auditor.linearizable_validation.contract_id': 'foo',
          },
          [],
          [],
      );
      expect(properties.getAuditorLinearizableValidationContractId()).toEqual(
          'validate-ledger',
      );
    },
);
