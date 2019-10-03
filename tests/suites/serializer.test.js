const {it} = require("mocha");
const {expect} = require("chai");
const {Encryptor} = require('../../dist');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const one_object = {foo: "bar"};
const cipher = new Encryptor({key});
const decipher = (data) => {
    return cipher.decrypt(data);
};

module.exports = function suite() {

    it('should set serialized_mode to php-serialized if no serialize_mode given', done => {
        const encryptor = new Encryptor({key});
        expect(encryptor.serialize_driver.driver.constructor.name === 'PhpSerializer')
            .to.be.equal(true);

        encryptor
            .encrypt(one_object)
            .then(res => {
                expect(decipher(res)).to.have.property('foo').equals('bar');
                done();
            })
    });

    it('should force serialize data input when serializer driver is php-serialized and data is not an object', done => {
        let encryptor = new Encryptor({key});
        encryptor
            .encrypt('baz', true)
            .then(encrypted => {
                const decrypted = encryptor.decrypt(encrypted);
                expect(encryptor.getRawDecrypted() === 's:3:"baz";').to.be.equal(true);
                expect(decrypted).equals('baz');
                done();
            })
    });

    it('should inject custom serializer driver in constructor', done => {
        const cipher = new Encryptor({key}, require('../lib/mockDriver'));
        expect(cipher.serialize_driver.driver.constructor.name)
            .equal('MockDriver');
        done()
    });

    it('should inject custom serializer driver at runtime', done => {
        const cipher = new Encryptor({key});
        cipher.setSerializerDriver(require('../lib/mockDriver'));
        expect(cipher.serialize_driver.driver.constructor.name)
            .equal('MockDriver');
        done()
    });


    it('should use injected serializer driver to serialize/deserialize data', done => {
        const cipher = new Encryptor({key}, require('../lib/mockDriver'));
        const enc = cipher.encryptSync(one_object);
        let dec = cipher.decrypt(enc);
        expect(cipher.getRawDecrypted() === JSON.stringify(one_object) + '-MOCKED').to.be.equal(true);
        expect(cipher.serialize_driver.driver.constructor.name)
            .equal('MockDriver');
        dec = JSON.parse(dec);

        expect(dec).hasOwnProperty(Object.keys(one_object)[0]);
        expect(dec[Object.keys(dec)[0]]).to.be.equal(one_object[Object.keys(one_object)[0]]);
        done()
    });
}
