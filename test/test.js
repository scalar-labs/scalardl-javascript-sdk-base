const {
  ClientService,
} = require('..');
const {
  IllegalArgumentError,
} = require('../illegal_argument_error');

const assert = require('chai').assert;
const ledgerClient = {};
const protobuf = {};

describe('The constructor', () => {
  describe('should throw an error', () => {
    it('when the private key is missing', () => {
      const clientProperties = {
        // "scalar.ledger.client.private_key_pem": "key",
        'scalar.ledger.client.cert_pem': 'cert',
        'scalar.ledger.client.cert_holder_id': 'hold',
      };
      assert.throws(() => {
        new ClientService(ledgerClient, protobuf, clientProperties);
      }, IllegalArgumentError, 'private_key_pem');
    });
    it('when the certificate is missing', () => {
      const clientProperties = {
        'scalar.ledger.client.private_key_pem': 'key',
        // 'scalar.ledger.client.cert_pem': 'cert',
        'scalar.ledger.client.cert_holder_id': 'hold',
      };
      assert.throws(() => {
        new ClientService(ledgerClient, protobuf, clientProperties);
      }, IllegalArgumentError, 'cert_pem');
    });
    it('when holder id is missing', () => {
      const clientProperties = {
        'scalar.ledger.client.private_key_pem': 'key',
        'scalar.ledger.client.cert_pem': 'cert',
        // 'scalar.ledger.client.cert_holder_id': 'hold',
      };
      assert.throws(() => {
        new ClientService(ledgerClient, protobuf, clientProperties);
      }, IllegalArgumentError, 'cert_holder_id');
    });
  });
});

it('Register contract should throw an error' +
  ' when contractBytes is not a Uint8Array',
async () => {
  const clientProperties = {
    'scalar.ledger.client.private_key_pem': 'key',
    'scalar.ledger.client.cert_pem': 'cert',
    'scalar.ledger.client.cert_holder_id': 'hold',
  };
  const service = new ClientService(ledgerClient, protobuf, clientProperties);
  service.client = 'toto';
  try {
    await service.registerContract('contract1', 'foo', 'wrongType');
  } catch (e) {
    assert.instanceOf(e, IllegalArgumentError);
  }
}
);
