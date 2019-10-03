const {it} = require("mocha");
const {expect} = require("chai");
const {Encryptor} = require('../../dist');
const text = 'resistance is futile';
const one_object = {foo: "bar"};

module.exports = function suite() {

    it('should generate a valid App key', done => {
        const randomKey = Encryptor.generateRandomKey();
        const encryptor = new Encryptor({key: randomKey});
        encryptor
            .encrypt(text)
            .then(enc => {
                const dec = encryptor.decrypt(enc);
                expect(dec).equal(text);
                done()
            });
    });

    it('should Cipher/deCipher correctly using static Encryptor methods', done => {
        const randomKey = Encryptor.generateRandomKey();
        const encrypt = Encryptor.static_cipher(randomKey, one_object);
        const decrypt = Encryptor.static_decipher(randomKey, encrypt);
        expect(decrypt).haveOwnProperty(Object.keys(one_object)[0]).equal('bar');
        done();
    });

    it('should Cipher correctly using static Encryptor method with callback function', done => {
        const randomKey = Encryptor.generateRandomKey();
        Encryptor.static_cipher(randomKey, one_object, null, (error, encrypted) => {
            const decrypt = Encryptor.static_decipher(randomKey, encrypted);
            expect(decrypt).haveOwnProperty(Object.keys(one_object)[0]).equal('bar');
            done();
        });
    });
}
