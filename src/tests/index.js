const {describe, it} = require("mocha");
const {expect} = require("chai");
const exec = require('child_process').exec;
const {Encryptor} = require('../');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const text = 'resistance is futile';
const one_object = {foo: "bar"};

const cipher = new Encryptor({key});

const decipher = (data) => {
    return cipher.decrypt(data);
};

describe('node Laravel Encryptor', function () {

    it('should cipher and decipher', done => {

        const encryptor = new Encryptor({
            key,
            key_length: 64
        });

        encryptor
            .encrypt(text)
            .then(enc => {
                const dec = encryptor.decrypt(enc);
                expect(dec).equal(text);
                done()
            });
    });

    it('should cipher and decipher object without serialize or stringify object', done => {

        const encryptor = new Encryptor({key});

        encryptor
            .encrypt(one_object)
            .then(res => {
                expect(decipher(res)).to.have.property('foo').equals('bar');
                done();
            })
    });

    it('should cipher and decipher with no key_length defined', done => {

        const encryptor = new Encryptor({
            key
        });

        encryptor
            .encrypt(text)
            .then(enc => {
                const dec = encryptor.decrypt(enc);
                expect(dec).equal(text);
                done();
            })
    });

    it('should cipher and decipher a number', done => {

        const number = 1;

        const encryptor = new Encryptor({
            key
        });

        encryptor
            .encrypt(number)
            .then(enc => {
                const dec = encryptor.decrypt(enc);
                expect(parseInt(dec)).equal(number);
                done();
            })
    });

    it('should throw Error when data to encrypt is null', done => {

        const encryptor = new Encryptor({key});

        try{
            encryptor
                .encrypt(null)
        }catch (e) {
            expect(e.message).equal('You are calling Encryptor without data to cipher');
            done();
        }
    });


    it('should fail cipher not valid Laravel Key', done => {
        const encryptor = new Encryptor({
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

        try {
            new Encryptor({
                key,
                key_length: 31
            });
        }catch (e) {
            expect(e.message)
                .equal('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
            done()
        }
    });

    it('should fail decipher not valid data', done => {
        const encryptor = new Encryptor({
            key,
        });

        try {
            encryptor.decrypt('foo');
        }catch (e) {
            expect(e.message)
                .equal('Encryptor decripIt cannot parse json');
            done()
        }
    });


    it('should decipher data at Laravel correctly', done => {
        const encryptor = new Encryptor({
            key
        });

        encryptor
            .encrypt(one_object)
            .then(enc => {
                exec(`php dist/tests/php/decrypt.php ${enc}`, function (err, stdout, stderr) {
                    if (err) {
                        console.error(err)
                    }
                    expect(stdout).equal(JSON.stringify(one_object));
                    done()
                });
            });
    });

    it('should decipher from Laravel correctly', done => {

        const encryptor = new Encryptor({
            key
        });

        exec(`php dist/tests/php/crypt.php`, function (err, stdout, stderr) {
            if (err) {
                console.error(err)
            }

            const dec = encryptor.decrypt(stdout);
            expect(dec).hasOwnProperty('foo');
            expect(dec.foo).equal('bar');
            done();
        });
    });

    it('should cipher and decipher Sync Mode', done => {

        const encryptor = new Encryptor({key});
        let enc = encryptor.encryptSync(text);
        let dec = encryptor.decrypt(enc);
        expect(dec).equal(text);
        done();
    });

    it('should decipher data, Sync Mode, at Laravel correctly', done => {
        const encryptor = new Encryptor({key});

        let enc = encryptor.encryptSync(one_object);

        exec(`php dist/tests/php/decrypt.php ${enc}`, function (err, stdout, stderr) {
            if (err) {
                console.error(err)
            }
            expect(stdout).equal(JSON.stringify(one_object));
            done()
        });
    });

});
