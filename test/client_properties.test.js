const {
  ClientProperties,
  ClientPropertiesField,
} = require('..');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('ClientProperties', () => {
  it('should work normally', () => {
    const properties = new ClientProperties(
        {
          'scalar.dl.client.cert_holder_id': 'foo',
          'scalar.dl.client.cert_version': 0,
        },
    );
    assert.equal('foo', properties.getCertHolderId());
    assert.equal(0, properties.getCertVersion());
  });

  it('should work normal with allOf', () => {
    const properties = new ClientProperties(
        {
          'scalar.dl.client.cert_holder_id': 'foo',
          'scalar.dl.client.cert_version': 0,
        },
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
        ],
    );
    assert.equal('foo', properties.getCertHolderId());
    assert.equal(0, properties.getCertVersion());
  });

  it('should throw errors when any property of allOf is not provided', () => {
    expect(() => {
      new ClientProperties({}, [ClientPropertiesField.CERT_HOLDER_ID]);
    }).to.throw(Error);
  });

  it('should work fine with oneOf', () => {
    const properties = new ClientProperties(
        {
          'scalar.dl.client.cert_holder_id': 'foo',
        },
        null,
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_PEM,
        ],
    );
    assert.equal('foo', properties.getCertHolderId());
  });

  it(
      'should throw errorswhen more than one properties of oneOf are provided',
      () => {
        expect(() => new ClientProperties(
            {
              'scalar.dl.client.cert_holder_id': 'foo',
              'scalar.dl.client.cert_version': 0,
            },
            null,
            [
              ClientPropertiesField.CERT_HOLDER_ID,
              ClientPropertiesField.CERT_VERSION,
            ],
        )).to.throw(Error);
      },
  );

  it('should work fine with allOf and OneOf', () => {
    const properties = new ClientProperties(
        {
          'scalar.dl.client.cert_holder_id': 'foo',
          'scalar.dl.client.cert_version': 0,
          'scalar.dl.client.private_key_pem': 'pem',
        },
        [
          ClientPropertiesField.CERT_HOLDER_ID,
          ClientPropertiesField.CERT_VERSION,
        ], // allOf
        [
          ClientPropertiesField.PRIVATE_KEY_PEM,
          ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY,
        ], // oneOf
    );
    assert.equal('foo', properties.getCertHolderId());
    assert.equal(0, properties.getCertVersion());
    assert.equal('pem', properties.getPrivateKeyPem());
  });

  it('should work fine with allOf and OneOf', () => {
    expect(() => new ClientProperties(
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
    )).to.throw(Error);
  });

  it('should set optional properties with default values', () => {
    const properties = new ClientProperties({}, [], []);

    assert.equal('localhost', properties.getServerHost());
    assert.equal(50051, properties.getServerPort());
    assert.equal(50052, properties.getServerPrivilegedPort());
    assert.equal('localhost', properties.getAuditorHost());
    assert.equal(40051, properties.getAuditorPort());
    assert.equal(40052, properties.getAuditorPrivilegedPort());
    assert.equal(1, properties.getCertVersion());
    assert.equal(false, properties.getTlsEnabled());
    assert.equal(false, properties.getAuditorEnabled());
  });

  it('should overwrite default values of default properties', () => {
    const properties = new ClientProperties({
      'scalar.dl.client.server.host': 'ledger.example.com',
      'scalar.dl.client.server.port': 80,
      'scalar.dl.client.server.privileged_port': 8080,
      'scalar.dl.client.auditor.host': 'auditor.example.com',
      'scalar.dl.client.auditor.port': 443,
      'scalar.dl.client.auditor.privileged_port': 4433,
      'scalar.dl.client.cert_version': 10,
      'scalar.dl.client.tls.enabled': true,
      'scalar.dl.client.auditor.enabled': true,
    }, [], []);

    assert.equal('ledger.example.com', properties.getServerHost());
    assert.equal(80, properties.getServerPort());
    assert.equal(8080, properties.getServerPrivilegedPort());
    assert.equal('auditor.example.com', properties.getAuditorHost());
    assert.equal(443, properties.getAuditorPort());
    assert.equal(4433, properties.getAuditorPrivilegedPort());
    assert.equal(10, properties.getCertVersion());
    assert.equal(true, properties.getTlsEnabled());
    assert.equal(true, properties.getAuditorEnabled());
  });

  it('should have default linearizable properties', () => {
    const properties = new ClientProperties({}, [], []);
    assert.equal(false, properties.getAuditorLinearizableValidationEnabled());
    assert.equal(
        'validate-ledger',
        properties.getAuditorLinearizableValidationContractId(),
    );
  });

  it(
      'should be able to configure linearizable properties in auditor mode',
      () => {
        const properties = new ClientProperties({
          'scalar.dl.client.auditor.enabled': true,
          'scalar.dl.client.auditor.linearizable_validation.enabled': true,
          'scalar.dl.client.auditor.linearizable_validation.contract_id': 'foo',
        }, [], []);
        assert.equal(
            true,
            properties.getAuditorLinearizableValidationEnabled(),
        );
        assert.equal(
            'foo',
            properties.getAuditorLinearizableValidationContractId(),
        );
      },
  );

  it(
      'should not be able to configure linearizable properties ' +
      'if it is not in auditor mode',
      () => {
        const properties = new ClientProperties({
          'scalar.dl.client.auditor.enabled': false,
          'scalar.dl.client.auditor.linearizable_validation.enabled': true,
          'scalar.dl.client.auditor.linearizable_validation.contract_id': 'foo',
        }, [], []);
        assert.equal(
            false,
            properties.getAuditorLinearizableValidationEnabled(),
        );
        assert.equal(
            'validate-ledger',
            properties.getAuditorLinearizableValidationContractId(),
        );
      },
  );
});
