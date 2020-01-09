const {EllipticSigner, JsrsasignSigner} = require('../signer');
const expect = require('chai').expect;
const assert = require('chai').assert;
const jsrsasign = require('jsrsasign');
const sinon = require('sinon');
const fs = require('fs');

const chai = require('chai');
chai.use(require('chai-as-promised'));

describe('The Signature Signers', () => {
  afterEach(function() {
    sinon.restore();
  });

  describe('Class JsrsasignSigner', () => {
    // Mock the ArrayBuffertoHex in signer class
    beforeEach(function() {
      sinon.replace(jsrsasign, 'ArrayBuffertohex',
          sinon.fake.returns('hex-value'));
    });

    it('throws exception when pem file is not correct', async () => {
      const signer = new JsrsasignSigner('incorrect pem');
      await expect(signer.sign('content'))
          .to.be.rejectedWith('Failed to load private key');
    });

    it('throws exception when it is not an ASN.1 hex string', async () => {
      const signer = new JsrsasignSigner('mocked non ASN.1 string');
      await expect(signer.sign('content'))
          .to.be.rejectedWith('Failed to load private key');
    });

    it('should work properly', async () => {
      const pem = fs.readFileSync(__dirname + '/key.pem', 'utf-8');
      const signer = new JsrsasignSigner(pem);
      assert.instanceOf(await signer.sign('Content'), Uint8Array);
    });
  });

  describe('Class EllipticSigner', () => {
    it('throws exception when the pem file is not correct', async () => {
      const signer = new EllipticSigner('incorrect pem');

      await expect(signer.sign('content')).to.be.rejectedWith(
          'Failed to sign the request'
      );
    });
    it('should work properly', async () => {
      const pem = fs.readFileSync(__dirname + '/key.pem', 'utf-8');
      const signer = new EllipticSigner(pem);
      assert.instanceOf(await signer.sign('Content'), Uint8Array);
    });
  });
});
