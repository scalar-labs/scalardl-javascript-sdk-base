const {SignatureSigner} = require('../signer.js');
const expect = require('chai').expect;
const jsrsasign = require('jsrsasign');
const sinon = require('sinon');

describe('Class SignatureSigner', () => {
  it('throws exception when pem file is not correct', () => {
    sinon.replace(jsrsasign, 'ArrayBuffertohex', sinon.fake.returns('CAFE'));
    const signer = new SignatureSigner('incorrect pem');
    expect(() => {
      signer.sign('content');
    }).to.throw('Failed to load private key');
  });

  it('throws exception when it not ASN.1 hex string', () => {
    const signer = new SignatureSigner('mocked_pem_file.pem');
    expect(() => {
      signer.sign('content');
    }).to.throw('Failed to load private key not ASN.1 hex string');
  });

  it('should work properly', () => {
    const signer = new SignatureSigner('ASN1.pem');
    expect(() => {
      signer.sign('content');
    }).to.throw('Failed to load private key not ASN.1 hex string');
  });

  it()
});
