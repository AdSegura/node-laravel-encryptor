"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_encryptor_1 = require("./base_encryptor");
const crypto = require('crypto');
class Encryptor extends base_encryptor_1.Base_encryptor {
    constructor(options) {
        super(options);
    }
    encrypt(data) {
        const payload = Encryptor.prepareData(data);
        return this
            .encryptIt(payload)
            .then(Encryptor.stringifyAndBase64, Encryptor.throwError);
    }
    encryptSync(data) {
        const payload = Encryptor.prepareData(data);
        return Encryptor.stringifyAndBase64(this.encryptItSync(payload));
    }
    encryptIt(data) {
        return this
            .generate_iv()
            .then(this.createCypherIv())
            .then(this.cipherIt(data))
            .then(this.generateEncryptedObject());
    }
    createCypherIv() {
        return (iv) => {
            try {
                return { iv, cipher: crypto.createCipheriv(this.algorithm, this.secret, iv) };
            }
            catch (e) {
                throw e;
            }
        };
    }
    cipherIt(data) {
        return ({ iv, cipher }) => {
            return {
                iv,
                value: cipher.update(data, 'utf8', 'base64') + cipher.final('base64')
            };
        };
    }
    decrypt(data) {
        return this.decryptIt(data);
    }
    generate_iv() {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(this.random_bytes, (err, buffer) => {
                if (err)
                    return reject(err);
                resolve(buffer.toString('hex'));
            });
        });
    }
    static throwError(error) {
        throw error;
    }
    static static_decipher(key, data) {
        const encrypt = new Encryptor({ key });
        return encrypt.decryptIt(data);
    }
    static static_cipher(key, data, cb) {
        const encrypt = new Encryptor({ key });
        if (typeof cb === 'function')
            encrypt.encrypt(data)
                .then(enc => cb(null, enc))
                .catch(e => cb(e));
        else
            return encrypt.encryptSync(data);
    }
}
exports.Encryptor = Encryptor;
