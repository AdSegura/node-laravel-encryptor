"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { it } = require("mocha");
const { expect } = require("chai");
const exec = require('child_process').exec;
const { Encryptor } = require('../../');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const one_object = { foo: "bar" };
const php_crypt = 'php src/tests/php/crypt.php';
const php_decrypt = 'php src/tests/php/decrypt.php';
function suite() {
    it('should decipher data at Laravel correctly with serialize_mode php', done => {
        const encryptor = new Encryptor({
            key,
            serialize_mode: 'php'
        });
        encryptor
            .encrypt(one_object)
            .then(enc => {
            exec(`${php_decrypt} ${enc}`, function (err, stdout, stderr) {
                if (err) {
                    console.error(err);
                }
                expect(stdout).equal(JSON.stringify(one_object));
                done();
            });
        });
    });
    it('should decipher from Laravel correctly with serialize_mode php', done => {
        const encryptor = new Encryptor({
            key,
            serialize_mode: 'php'
        });
        exec(`${php_crypt}`, function (err, stdout, stderr) {
            if (err) {
                console.error(err);
            }
            const dec = encryptor.decrypt(stdout);
            expect(dec).hasOwnProperty('foo');
            expect(dec.foo).equal('bar');
            done();
        });
    });
    it('should decipher data, Sync Mode, at Laravel correctly with serialize_mode php', done => {
        const encryptor = new Encryptor({ key, serialize_mode: 'php' });
        let enc = encryptor.encryptSync(one_object);
        exec(`${php_decrypt} ${enc}`, function (err, stdout, stderr) {
            if (err) {
                console.error(err);
            }
            expect(stdout).equal(JSON.stringify(one_object));
            done();
        });
    });
}
exports.default = suite;
