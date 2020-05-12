const Ajv = require('ajv');
const ajv = new Ajv();

const ClientPropertiesField = {
  CERT_HOLDER_ID: 'scalar.dl.client.cert_holder_id',
  CERT_VERSION: 'scalar.dl.client.cert_version',
  CERT_PEM: 'scalar.dl.client.cert_pem',
  PRIVATE_KEY_PEM: 'scalar.dl.client.private_key_pem',
  PRIVATE_KEY_CRYPTOKEY: 'scalar.dl.client.private_key_cryptokey',
  SERVER_HOST: 'scalar.dl.client.server.host',
  SERVER_PORT: 'scalar.dl.client.server.port',
  SERVER_PRIVILEGED_PORT: 'scalar.dl.client.server.privileged_port',
  TLS_CA_ROOT_CERT_PEM: 'scalar.dl.client.tls.ca_root_cert_pem',
  TLS_ENABLED: 'scalar.dl.client.tls.enabled',
  AUTHORIZATION_CREDENTIAL: 'scalar.dl.client.authorization.credential',
};

const defaultSchema = {
  '$schema': 'http://json-schema.org/draft-07/schema',
  'type': 'object',
  'properties': {},
};
defaultSchema.properties[ClientPropertiesField.CERT_HOLDER_ID] = {
  'type': 'string',
};
defaultSchema.properties[ClientPropertiesField.CERT_VERSION] = {
  'type': 'number',
};
defaultSchema.properties[ClientPropertiesField.CERT_PEM] = {
  'type': 'string',
};
defaultSchema.properties[ClientPropertiesField.PRIVATE_KEY_PEM] = {
  'type': 'string',
};
defaultSchema.properties[ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY] = {
  'type': 'object',
};
defaultSchema.properties[ClientPropertiesField.SERVER_HOST] = {
  'type': 'string',
};
defaultSchema.properties[ClientPropertiesField.SERVER_PORT] = {
  'type': 'number',
};
defaultSchema.properties[ClientPropertiesField.SERVER_PRIVILEGED_PORT] = {
  'type': 'number',
};
defaultSchema.properties[ClientPropertiesField.TLS_CA_ROOT_CERT_PEM] = {
  'type': 'string',
};
defaultSchema.properties[ClientPropertiesField.TLS_ENABLED] = {
  'type': 'boolean',
};
defaultSchema.properties[ClientPropertiesField.AUTHORIZATION_CREDENTIAL] = {
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
    return this.properties[ClientPropertiesField.CERT_HOLDER_ID];
  }

  /**
   * @return {Number}
   */
  getCertVersion() {
    return this.properties[ClientPropertiesField.CERT_VERSION];
  }

  /**
   * @return {String}
   */
  getCertPem() {
    return this.properties[ClientPropertiesField.CERT_PEM];
  }

  /**
   * @return {String}
   */
  getPrivateKeyPem() {
    return this.properties[ClientPropertiesField.PRIVATE_KEY_PEM];
  }

  /**
   * @return {!CryptoKey}
   */
  getPrivateKeyCryptoKey() {
    return this.properties[ClientPropertiesField.PRIVATE_KEY_CRYPTOKEY];
  }

  /**
   * @return {String}
   */
  getServerHost() {
    return this.properties[ClientPropertiesField.SERVER_HOST];
  }

  /**
   * @return {Number}
   */
  getServerPort() {
    return this.properties[ClientPropertiesField.SERVER_PORT];
  }

  /**
   * @return {Number}
   */
  getServerPrivilegedPort() {
    return this.properties[ClientPropertiesField.SERVER_PRIVILEGED_PORT];
  }

  /**
   * @return {String}
   */
  getTlsCaRootCertPem() {
    return this.properties[ClientPropertiesField.TLS_CA_ROOT_CERT_PEM];
  }

  /**
   * @return {Boolean}
   */
  getTlsEnabled() {
    return this.properties[ClientPropertiesField.TLS_ENABLED];
  }

  /**
   * @return {String}
   */
  getAuthorizationCredential() {
    return this.properties[ClientPropertiesField.AUTHORIZATION_CREDENTIAL];
  }
}

module.exports = {
  ClientProperties,
  ClientPropertiesField,
};
