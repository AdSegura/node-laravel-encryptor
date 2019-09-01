const {describe, before, after, it} = require("mocha");
const {expect} = require("chai");
const {LaravelEncryptor} = require('../dist/');
const laravel_key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const text ='resistance is futile';

describe('node Laravel Encrypter', function () {

    it('should cipher and decipher', done => {

        const laravelEncryptor = new LaravelEncryptor({
            laravel_key,
            key_length: 64
        });

        laravelEncryptor
            .encrypt(text)
            .then(enc => {
                console.log(enc)
                laravelEncryptor.decrypt(enc).then(res => {
                    expect(res).equal(text);
                    done()
                })
        })
    });

    it('should cipher and decipher with no key_length defined', done => {

        const laravelEncryptor = new LaravelEncryptor({
            laravel_key
        });

        laravelEncryptor
            .encrypt(text)
            .then(enc => {
                laravelEncryptor
                    .decrypt(enc)
                    .then(res => {
                        expect(res).equal(text);
                        done()
                })
            })
    });

    it('should cipher and decipher with no serialize nor unserialize', done => {

        const serialize = false;

        const laravelEncryptor = new LaravelEncryptor({
            laravel_key
        });

        laravelEncryptor
            .encrypt(text, serialize)
            .then(enc => {
                laravelEncryptor
                    .decrypt(enc, serialize)
                    .then(res => {
                        expect(res).equal(text);
                        done()
                    })
            })
    });

    it('should fail cipher not valid Laravel Key', done => {
        const laravelEncryptor = new LaravelEncryptor({
            laravel_key: 'foobarbaz'
        });

        laravelEncryptor
            .encrypt(text)
            .then()
            .catch(e => {
                expect(e.message)
                    .equal('Invalid key length');
                done()
            })
    });

    it('should fail cipher not valid algorithm', done => {
        const laravelEncryptor = new LaravelEncryptor({
            laravel_key,
            key_length: 31
        });

        laravelEncryptor
            .encrypt(text)
            .then()
            .catch(e => {
                expect(e.message)
                    .equal('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
                done()
            })
    });

    it('should fail decipher not valid data', done => {
        const laravelEncryptor = new LaravelEncryptor({
            laravel_key,
        });

        laravelEncryptor
            .decrypt('foo')
            .then()
            .catch(e => {
                expect(e.message)
                    .equal('Unexpected token ~ in JSON at position 0');
                done()
            })
    });




});