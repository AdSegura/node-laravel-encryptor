const {it} = require("mocha");
const {expect} = require("chai");
const exec = require('child_process').exec;
const {Encryptor} = require('../../dist');
const one_object = {foo: "bar"};
const php_crypt = 'php tests/php/crypt.php';
const php_decrypt = 'php tests/php/decrypt.php';

module.exports = function suite(mode, key) {

    let key_length = 256;
    if(mode === 'AES-128-CBC') key_length = 128;

    it('should decipher data at Laravel correctly with serialize_mode php', done => {

        const encryptor = new Encryptor({
            key,
            serialize_mode:'php',
            key_length
        });

        encryptor
            .encrypt(one_object)
            .then(enc => {
                exec(`${php_decrypt} ${key} ${mode} ${enc}`, function (err, stdout, stderr) {
                    if (err) {
                        console.error(err)
                    }
                    expect(stdout).equal(JSON.stringify(one_object));
                    done()
                });
            });
    });

    it('should decipher from Laravel correctly with serialize_mode php', done => {
        const encryptor = new Encryptor({
            key,
            serialize_mode:'php',
            key_length
        });

        exec(`${php_crypt} ${key} ${mode}`, function (err, stdout, stderr) {
            if (err) {
                console.error(err)
            }

            const dec = encryptor.decrypt(stdout);
            expect(dec).hasOwnProperty('foo');
            expect(dec.foo).equal('bar');
            done();
        });
    });

    it('should decipher data, Sync Mode, at Laravel correctly with serialize_mode php', done => {
        const encryptor = new Encryptor({
            key,
            serialize_mode:'php',
            key_length
        });
        let enc = encryptor.encryptSync(one_object);

        exec(`${php_decrypt} ${key} ${mode} ${enc}`, function (err, stdout, stderr) {
            if (err) {
                console.error(err)
            }
            expect(stdout).equal(JSON.stringify(one_object));
            done()
        });
    });
}
