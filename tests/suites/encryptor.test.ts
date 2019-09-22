const {it} = require("mocha");
const {expect} = require("chai");
const {Encryptor} = require('../../dist');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const text = 'resistance is futile';
const one_object = {foo: "bar"};

export default function suite(serialize_mode: 'json'|'php') {
    const cipher = new Encryptor({key, serialize_mode});
    const decipher = (data) => {
        return cipher.decrypt(data);
    };

    it(`should cipher and decipher text`, done => {
        const encryptor = new Encryptor({
            key, serialize_mode, key_length: 64
        });
        encryptor
            .encrypt(text)
            .then(enc => {
                const dec = encryptor.decrypt(enc);
                expect(dec).equal(text);
                done()
            });
    });

    it('should cipher and decipher object', done => {
        const encryptor = new Encryptor({key, serialize_mode});
        encryptor
            .encrypt(one_object)
            .then(res => {
                expect(decipher(res)).to.have.property('foo').equals('bar');
                done();
            })
    });

    if ('php' === serialize_mode){
        it('should set serialized_mode to php-serialized if no serialize_mode given', done => {
            const encryptor = new Encryptor({key});
            encryptor
                .encrypt(one_object)
                .then(res => {
                    //TODO serialize_mode php-serialize returns string non an object
                    expect(JSON.parse(decipher(res))).to.have.property('foo').equals('bar');
                    done();
                })
        });
    }

    it('should cipher and decipher with no key_length defined', done => {
        const encryptor = new Encryptor({key, serialize_mode});
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
        const encryptor = new Encryptor({key, serialize_mode});
        encryptor
            .encrypt(number)
            .then(enc => {
                const dec = encryptor.decrypt(enc);
                expect(parseInt(dec)).equal(number);
                done();
            })
    });

    it('should cipher and decipher Sync Mode', done => {

        const encryptor = new Encryptor({key, serialize_mode});
        let enc = encryptor.encryptSync(text);
        let dec = encryptor.decrypt(enc);
        expect(dec).equal(text);
        done();
    });
}
