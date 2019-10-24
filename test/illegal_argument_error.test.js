const {IllegalArgumentError} = require('../illegal_argument_error');
const expect = require('chai').expect;

describe('Class IllegalArgumentError', () => {
  describe('The constructor', () => {
    it('is able to create an error object', () => {
      expect(new IllegalArgumentError('message')).to.be.an.instanceof(Error);
    });
  });

  describe('The instance', () => {
    it('has a particular name called IllegalArgumentError', () => {
      expect(new IllegalArgumentError('message')).to.have.property(
          'name',
          'IllegalArgumentError'
      );
    });
    it('sets the correct message', () => {
      const e = new IllegalArgumentError('error message');
      expect(e.message).to.equal('error message');
    });

    it('has a complete name', () => {
      const e = new IllegalArgumentError('hello');
      expect(e.toString()).to.equal('IllegalArgumentError: hello');
    });
  });
});
