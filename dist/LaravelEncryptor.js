"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_encryptor_1 = require("./base_encryptor");
const crypto = require('crypto');
class LaravelEncryptor extends base_encryptor_1.Base_encryptor {
    constructor(options) {
        super(options);
    }
    encrypt(data, serialize) {
        serialize = (serialize !== undefined) ? serialize : true;
        const payload = serialize ? LaravelEncryptor.serialize(data) : data;
        return this
            .encryptIt(payload)
            .then(LaravelEncryptor.stringifyAndBase64, LaravelEncryptor.throwError);
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
    generateEncryptedObject() {
        return ({ iv, value }) => {
            iv = LaravelEncryptor.toBase64(iv);
            return {
                iv,
                value,
                mac: this.hashIt(iv, value)
            };
        };
    }
    decrypt(data, serialize) {
        return this.decryptIt(data, serialize);
    }
    decryptIt(payload, serialize) {
        serialize = (serialize !== undefined) ? serialize : true;
        payload = LaravelEncryptor.base64ToUtf8(payload);
        try {
            payload = JSON.parse(payload);
        }
        catch (e) {
            return Promise.reject(e);
        }
        return this
            .createDecipheriv(payload.iv)
            .then(this.cryptoDecipher(payload))
            .then(this.ifSerialized_unserialize(serialize), LaravelEncryptor.throwError);
    }
    createDecipheriv(iv) {
        return new Promise((resolve, reject) => {
            try {
                const deCipher = crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(iv, 'base64'));
                resolve(deCipher);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    cryptoDecipher(payload) {
        return (deCipher) => {
            return deCipher.update(payload.value, 'base64', 'utf8') + deCipher.final('utf8');
        };
    }
    ifSerialized_unserialize(serialize) {
        return (decrypted) => {
            return serialize ? LaravelEncryptor.unSerialize(decrypted) : decrypted;
        };
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
}
exports.LaravelEncryptor = LaravelEncryptor;
