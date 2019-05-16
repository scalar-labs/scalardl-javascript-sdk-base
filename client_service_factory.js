const {ClientService} = require('./client_service');
const {IllegalArgumentError} = require('./illegal_argument_error');

/**
 * @class
 */
class ClientServiceFactory {
  /**
     * @constructor
     * @param {LedgerClient} ledgerClient The LedgerClient object to inject
     * @param {Protobuf} protobuf The protobuf message object to inject
     */
  constructor(ledgerClient, protobuf) {
    if (!ledgerClient || !protobuf) {
      throw new IllegalArgumentError(
          'Can not initiate ClientServiceFactory with undefiend arguments'
      );
    }
    this.ledgerClient = ledgerClient;
    this.protobuf = protobuf;
  }

  /**
     * @param {Object} properties JSON Object used for setting client properties
     * @return {ClientService}
     */
  create(properties) {
    return new ClientService(this.ledgerClient, this.protobuf, properties);
  }
}

module.exports = {
  ClientServiceFactory,
};
