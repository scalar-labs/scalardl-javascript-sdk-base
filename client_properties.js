const Ajv = require('ajv');
const ajv = new Ajv();

const CERT_HOLDER_ID = 'scalar.dl.client.cert_holder_id';
const CERT_VERSION = 'scalar.dl.client.cert_version';
const CERT_PEM = 'scalar.dl.client.cert_pem';
const PRIVATE_KEY_PEM = 'scalar.dl.client.private_key_pem';
const SERVER_HOST = 'scalar.dl.client.server.host';
const SERVER_PORT = 'scalar.dl.client.server.port';
const SERVER_PRIVILEGED_PORT = 'scalar.dl.client.server.privileged_port';
const TLS_CA_ROOT_CERT_PEM = 'scalar.dl.client.tls.ca_root_cert_pem';

const defaultSchema = {
  '$schema': 'http://json-schema.org/draft-07/schema',
  'type': 'object',
  'properties': {},
};
defaultSchema.properties[CERT_HOLDER_ID] = {
  'type': 'string',
};
defaultSchema.properties[CERT_VERSION] = {
  'type': 'number',
};
defaultSchema.properties[CERT_PEM] = {
  'type': 'string',
};
defaultSchema.properties[PRIVATE_KEY_PEM] = {
  'type': 'string',
};
defaultSchema.properties[SERVER_HOST] = {
  'type': 'string',
};
defaultSchema.properties[SERVER_PORT] = {
  'type': 'number',
};
defaultSchema.properties[SERVER_PRIVILEGED_PORT] = {
  'type': 'number',
};
defaultSchema.properties[TLS_CA_ROOT_CERT_PEM] = {
  'type': 'string',
};

/**
 * A class represents client properties object
 */
class ClientProperties {
  /**
   * @param {Object} properties native JavaScript object containing properties
   * @param {Array} required array of string. required properties
   */
  constructor(properties, required) {
    const schema = {
      ...defaultSchema,
      ...{'required': required},
    };
    if (!ajv.validate(schema, properties)) {
      throw new Error(
          ajv.errors.reduce(
              (message, error) => `${message} ${error.message}`,
              'In the client properties:',
          ),
      );
    }

    this.properties = properties;
  }

  /**
   * @return {String}
   */
  getCertHolderId() {
    return this.properties[CERT_HOLDER_ID];
  }

  /**
   * @return {Number}
   */
  getCertVersion() {
    return this.properties[CERT_VERSION];
  }

  /**
   * @return {String}
   */
  getCertPem() {
    return this.properties[CERT_PEM];
  }

  /**
   * @return {String}
   */
  getPrivateKeyPem() {
    return this.properties[PRIVATE_KEY_PEM];
  }

  /**
   * @return {String}
   */
  getServerHost() {
    return this.properties[SERVER_HOST];
  }

  /**
   * @return {Number}
   */
  getServerPort() {
    return this.properties[SERVER_PORT];
  }

  /**
   * @return {Number}
   */
  getServerPrivilegedPort() {
    return this.properties[SERVER_PRIVILEGED_PORT];
  }

  /**
   * @return {String}
   */
  getTlsCaRootCertPem() {
    return this.properties[TLS_CA_ROOT_CERT_PEM];
  }
}

module.exports = {
  ClientProperties,
};
