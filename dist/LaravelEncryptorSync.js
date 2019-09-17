"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_encryptor_1 = require("./base_encryptor");
const crypto = require('crypto');
class LaravelEncryptorSync extends base_encryptor_1.Base_encryptor {
    constructor(options) {
        super(options);
    }
    encrypt(data, serialize) {
        serialize = (serialize !== undefined) ? serialize : true;
        const payload = serialize ? LaravelEncryptorSync.serialize(data) : data;
        return LaravelEncryptorSync.stringifyAndBase64(this.encryptIt(payload));
    }
    encryptIt(data) {
        const buf = crypto.randomBytes(this.random_bytes);
        const iv = buf.toString('hex');
        const cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);
        const value = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
        return this.generateEncryptedObject({ iv, value });
    }
    generateEncryptedObject({ iv, value }) {
        iv = LaravelEncryptorSync.toBase64(iv);
        return {
            iv,
            value,
            mac: this.hashIt(iv, value)
        };
    }
    decrypt(data, serialize) {
        return this.decryptIt(data, serialize);
    }
    decryptIt(payload, serialize) {
        serialize = (serialize !== undefined) ? serialize : true;
        payload = LaravelEncryptorSync.base64ToUtf8(payload);
        try {
            payload = JSON.parse(payload);
        }
        catch (e) {
            throw e;
        }
        const deCipher = crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(payload.iv, 'base64'));
        const deciphered = deCipher.update(payload.value, 'base64', 'utf8') + deCipher.final('utf8');
        return this.ifSerialized_unserialize(deciphered, serialize);
    }
}
exports.LaravelEncryptorSync = LaravelEncryptorSync;
