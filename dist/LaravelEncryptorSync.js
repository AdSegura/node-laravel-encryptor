"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serialize = require('php-serialize');
const crypto = require('crypto');
class LaravelEncryptorSync {
    constructor(options) {
        this.options = options;
        this.key_length = 64;
        this.valid_key_lengths = [32, 64];
        if (this.options.laravel_key)
            console.log('Laravel Encryptor, laravel_key is depreciated, please use key instead');
        const key = this.options.laravel_key ? this.options.laravel_key : this.options.key;
        this.setAlgorithm();
        this.secret = Buffer.from(key, 'base64');
    }
    setAlgorithm() {
        if (this.options.key_length && this.valid_key_lengths.indexOf(this.options.key_length) < 0)
            throw new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
        this.algorithm = this.options.key_length ?
            `aes-${this.options.key_length * 4}-cbc` : `aes-${this.key_length * 4}-cbc`;
    }
    encrypt(data, serialize) {
        serialize = (serialize !== undefined) ? serialize : true;
        const payload = serialize ? LaravelEncryptorSync.serialize(data) : data;
        return LaravelEncryptorSync.stringifyAndBase64(this.encryptIt(payload));
    }
    encryptIt(data) {
        const buf = crypto.randomBytes(8);
        let iv = buf.toString('hex');
        let cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);
        let value = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
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
        let deciphered = deCipher.update(payload.value, 'base64', 'utf8') + deCipher.final('utf8');
        return this.ifSerialized_unserialize(deciphered, serialize);
    }
    ifSerialized_unserialize(decrypted, serialize) {
        return serialize ? LaravelEncryptorSync.unSerialize(decrypted) : decrypted;
    }
    static serialize(data) {
        return Serialize.serialize(data);
    }
    static unSerialize(data) {
        return Serialize.unserialize(data);
    }
    static toBase64(data) {
        return Buffer.from(data).toString('base64');
    }
    static base64ToUtf8(data) {
        return Buffer.from(data, 'base64').toString('utf8');
    }
    hashIt(iv, encrypted) {
        const hmac = LaravelEncryptorSync.createHmac("sha256", this.secret);
        return hmac
            .update(LaravelEncryptorSync.setHmacPayload(iv, encrypted))
            .digest("hex");
    }
    static createHmac(alg, secret) {
        return crypto.createHmac(alg, secret);
    }
    static setHmacPayload(iv, encrypted) {
        return Buffer.from(iv + encrypted, 'utf-8');
    }
    static stringifyAndBase64(encrypted) {
        encrypted = JSON.stringify(encrypted);
        return Buffer.from(encrypted).toString('base64');
    }
    static generateRandomKey(length) {
        return new Promise((resolve, reject) => {
            length = length ? length : 32;
            crypto.randomBytes(length, (err, buffer) => {
                if (err)
                    return reject(err);
                resolve(buffer.toString('base64'));
            });
        });
    }
}
exports.LaravelEncryptorSync = LaravelEncryptorSync;
