const {describe, it} = require("mocha");
const {expect} = require("chai");
const exec = require('child_process').exec;
const {LaravelEncryptor} = require('../dist/');
const {Encryptor} = require('../dist/');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const text = 'resistance is futile';
const one_object = {foo: "bar"};

describe('node Laravel Encrypter', function () {

    it('should cipher and decipher', done => {

        const encryptor = new Encryptor({
            key,
            key_length: 64
        });

        encryptor
            .encrypt(text)
            .then(enc => {
                encryptor.decrypt(enc).then(res => {
                    expect(res).equal(text);
                    done()
                })
            })
    });

    it('should fail cipher and decipher object without serialize', done => {

        const encryptor = new Encryptor({
            key,
            key_length: 64
        });

        encryptor
            .encrypt(one_object, false)
            .then()
            .catch(e => {
                expect(e.message).equals('The "data" argument must be one of type string, Buffer, TypedArray, or DataView. Received type object');
                done()
            })
    });

    it('should cipher and decipher with no key_length defined', done => {

        const encryptor = new LaravelEncryptor({
            key
        });

        encryptor
            .encrypt(text)
            .then(enc => {
                encryptor
                    .decrypt(enc)
                    .then(res => {
                        expect(res).equal(text);
                        done()
                    })
            })
    });


    it('should cipher and decipher with no serialize nor unserialize', done => {

        const serialize = false;

        const encryptor = new LaravelEncryptor({
            key
        });

        encryptor
            .encrypt(text, serialize)
            .then(enc => {
                encryptor
                    .decrypt(enc, serialize)
                    .then(res => {
                        expect(res).equal(text);
                        done()
                    })
            })
    });

    it('should fail cipher not valid Laravel Key', done => {
        const encryptor = new LaravelEncryptor({
            key: 'foobarbaz'
        });

        encryptor
            .encrypt(text)
            .then()
            .catch(e => {
                expect(e.message)
                    .equal('Invalid key length');
                done()
            })
    });

    it('should fail cipher not valid algorithm', done => {
        const encryptor = new LaravelEncryptor({
            key,
            key_length: 31
        });

        encryptor
            .encrypt(text)
            .then()
            .catch(e => {
                expect(e.message)
                    .equal('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
                done()
            })
    });

    it('should fail decipher not valid data', done => {
        const encryptor = new LaravelEncryptor({
            key,
        });

        encryptor
            .decrypt('foo')
            .then()
            .catch(e => {
                expect(e.message)
                    .equal('Unexpected token ~ in JSON at position 0');
                done()
            })
    });

    it('should cipher and decipher multiple times', done => {

        const encryptor = new LaravelEncryptor({
            key
        });

        const promises = [];

        for (let i = 0; i <= 3; i++) {
            promises.push(encryptor.encrypt(`foo-${i}`, false))
        }

        Promise.all(promises)
            .then(res => {
                res.map((enc, i) => {
                    encryptor.decrypt(enc, false)
                        .then(res => {
                            expect(res).equal(`foo-${i}`)
                        })
                })
            }).then(() => done())

    });

    it('should decipher data at Laravel correctly', done => {
        const encryptor = new LaravelEncryptor({
            key
        });

        encryptor
            .encrypt(one_object)
            .then(enc => {
                exec(`php tests/php/decrypt.php ${enc}`, function (err, stdout, stderr) {
                    if (err) {
                        console.error(err)
                    }
                    expect(stdout).equal(JSON.stringify(one_object));
                    done()
                });
            });
    });

    it('should decipher from Laravel correctly', done => {

        const encryptor = new LaravelEncryptor({
            key
        });

        exec(`php tests/php/crypt.php`, function (err, stdout, stderr) {
            if (err) {
                console.error(err)
            }
            encryptor
                .decrypt(stdout)
                .then(decrypted => {
                    expect(decrypted).hasOwnProperty('foo');
                    expect(decrypted.foo).equal('bar');
                    done()
                })
        });

    });
});
