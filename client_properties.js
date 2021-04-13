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
  AUDITOR_ENABLED: 'scalar.dl.client.auditor.enabled',
  AUDITOR_HOST: 'scalar.dl.client.auditor.host',
  AUDITOR_PORT: 'scalar.dl.client.auditor.port',
  AUDITOR_PRIVILEGED_PORT: 'scalar.dl.client.auditor.privileged_port',
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
defaultSchema.properties[ClientPropertiesField.AUDITOR_ENABLED] = {
  'type': 'boolean',
};
defaultSchema.properties[ClientPropertiesField.AUDITOR_HOST] = {
  'type': 'string',
};
defaultSchema.properties[ClientPropertiesField.AUDITOR_PORT] = {
  'type': 'number',
};
defaultSchema.properties[ClientPropertiesField.AUDITOR_PRIVILEGED_PORT] = {
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
   * @param {Array} allOf array of string. required properties
   * @param {Array} oneOf array of string. required properties
   */
  constructor(properties, allOf, oneOf) {
    allOf = allOf || [];
    oneOf = oneOf || [];

    const schema = {
      ...defaultSchema,
    };

    if (allOf.length > 0) {
      schema['allOf'] = allOf.map((property) => ({'required': [property]}));
    }

    if (oneOf.length > 0) {
      schema['oneOf'] = oneOf.map((property) => ({'required': [property]}));
    }

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
   * @return {Boolean}
   */
  getAuditorEnabled() {
    return this.properties[ClientPropertiesField.AUDITOR_ENABLED];
  }

  /**
   * @return {String}
   */
  getAuditorHost() {
    return this.properties[ClientPropertiesField.AUDITOR_HOST];
  }

  /**
   * @return {Number}
   */
  getAuditorPort() {
    return this.properties[ClientPropertiesField.AUDITOR_PORT];
  }

  /**
   * @return {Number}
   */
  getAuditorPrivilegedPort() {
    return this.properties[ClientPropertiesField.AUDITOR_PRIVILEGED_PORT];
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
