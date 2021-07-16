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
      new ClientProperties(
          {
            'scalar.dl.client.cert_holder_id': 'foo',
          },
          [
            ClientPropertiesField.CERT_HOLDER_ID,
            ClientPropertiesField.CERT_VERSION,
          ],
      );
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
          ClientPropertiesField.CERT_VERSION,
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
});
