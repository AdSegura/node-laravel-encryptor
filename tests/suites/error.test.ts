const {it} = require("mocha");
const {expect} = require("chai");
const {Encryptor} = require('../../dist');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const text = 'resistance is futile';
const one_object = {foo: "bar"};

export default function suite() {

    it('should throw \'EncryptorError\' Error Type', done => {
        const encryptor = new Encryptor({key});
        try {
            encryptor
                .encryptSync(null)
        } catch (e) {
            expect(e.name).equal('EncryptorError');
            done();
        }
    });

    it("should throw 'encrypt no data given' EncryptorError when data to encrypt is null", done => {
        const encryptor = new Encryptor({key});
        try {
            encryptor
                .encrypt(null)
        } catch (e) {
            expect(e.name).equal('EncryptorError');
            expect(e.message).equal('encrypt no data given');
            done();
        }
    });

    it("should throw 'decrypt no data given' EncryptorError when data to decrypt is null", done => {
        const encryptor = new Encryptor({key});
        try {
            encryptor
                .decrypt(null)
        } catch (e) {
            expect(e.name).equal('EncryptorError');
            expect(e.message).equal('decrypt no data given');
            done();
        }
    });


    it("should throw 'not valid Key' EncryptorError when key not valid", done => {
        const encryptor = new Encryptor({key: 'foobarbaz'});

        encryptor
            .encrypt(text)
            .then()
            .catch(e => {
                expect(e.name).equal('EncryptorError');
                expect(e.message).equal('Invalid key length');
                done()
            })
    });

    it("should throw 'not valid algorithm' EncryptorError when algorithm not valid", done => {
        try {
            new Encryptor({
                key,
                key_length: 31
            });
        } catch (e) {
            expect(e.name).equal('EncryptorError');
            expect(e.message)
                .equal('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
            done()
        }
    });

    it("should throw 'not valid Json' EncryptorError when decipher not valid payload", done => {
        const encryptor = new Encryptor({
            key,
        });

        try {
            encryptor.decrypt('foo');
        } catch (e) {
            expect(e.name).equal('EncryptorError');
            expect(e.message)
                .equal('Encryptor decryptIt cannot parse json');
            done()
        }
    });

    it("should throw 'invalid MAC signature' EncryptorError when deciphering tampered signature", done => {
        const encryptor = new Encryptor({key});

        const encrypted = encryptor.encryptSync(one_object);

        let fake = Buffer.from(encrypted, 'base64').toString('utf8');

        fake = JSON.parse(fake);

        // @ts-ignore
        fake.mac = 99;

        fake = Buffer.from(JSON.stringify(fake), 'utf8').toString('base64');

        try {
            encryptor.decrypt(fake)
        } catch (e) {
            expect(e.name).equal('EncryptorError');
            expect(e.message).equal('The MAC is invalid.');
            done()
        }
    });

    it("should throw 'invalid Payload' EncryptorError when decipher cannot validate payload", done => {
        const encryptor = new Encryptor({key});

        const encrypted = encryptor.encryptSync(one_object);

        let fake = Buffer.from(encrypted, 'base64').toString('utf8');

        fake = JSON.parse(fake);

        // @ts-ignore
        fake = Buffer.from(JSON.stringify({iv: fake.iv, value: fake.value}), 'utf8').toString('base64');

        try {
            encryptor.decrypt(fake);
        } catch (e) {
            expect(e.name).equal('EncryptorError');
            expect(e.message).equal('The payload is invalid.');
            done()
        }
    });

    it("should throw 'invalid iv length' EncryptorError when deciphering with invalid IV", done => {
        const encryptor = new Encryptor({key});

        const encrypted = encryptor.encryptSync(one_object);

        let fake = Buffer.from(encrypted, 'base64').toString('utf8');

        fake = JSON.parse(fake);

        // @ts-ignore
        fake.iv = '22';

        fake = Buffer.from(JSON.stringify(fake), 'utf8').toString('base64');

        try {
            encryptor.decrypt(fake);
        } catch (e) {
            expect(e.name).equal('EncryptorError');
            expect(e.message).equal('The payload is invalid.');
            done()
        }
    });

    it('should throw \'validateSerializerDriver\' EncryptorError when custom serializer driver not implements Serializer interface',
            done => {
                const badSerializerDriver =
                    module.exports =
                        class badSerializerDriver{serialize(){}};
                try {
                    new Encryptor({key}, badSerializerDriver);
                }catch (e) {
                    expect(e.name).equal('EncryptorError');
                    expect(e.message).equal('validateSerializerDriver');
                    done()
                }
    });

    it('should throw \'Serializer Encryptor Class unknown option\' EncryptorError when options.serialize_mode != json/php ',
            done => {
                try {
                    new Encryptor({key, serialize_mode: 'foo'});
                } catch (e) {
                    expect(e.name).equal('EncryptorError');
                    expect(e.message).equal('Serializer Encryptor Class unknown option foo serialize_mode');
                    done();
                }
    });
}
