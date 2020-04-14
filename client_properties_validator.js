const Ajv = require('ajv');
const ajv = new Ajv();

const defaultSchema = {
  'properties': {
    'scalar.dl.client.cert_holder_id': {
      'type': 'string',
    },
    'scalar.dl.client.cert_version': {
      'type': 'number',
    },
    'scalar.dl.client.cert_pem': {
      'type': 'string',
    },
    'scalar.dl.client.private_key_pem': {
      'type': 'string',
    },
  },
};

/**
 * A validator used to validate the client properties object
 */
class ClientPropertiesValidator {
  /**
   * @param {Array} required array of string. required properties
   */
  constructor(required) {
    this.required = required;
  }

  /**
   * @param {Object} properties
   * @throws {Error}
   */
  validate(properties) {
    const schema = Object.assign(defaultSchema, {'required': this.required});
    if (!ajv.validate(schema, properties)) {
      throw new Error(
          ajv.errors.reduce(
              (message, error) => `${message}\n${error.message}`,
              'In the client properties:'
          )
      );
    }
  }
}

module.exports = {
  ClientPropertiesValidator,
};
