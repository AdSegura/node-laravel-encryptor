"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serialize = require('php-serialize');
const crypto = require('crypto');
class Base_encryptor {
    constructor(options) {
        this.options = options;
        this.key_length = 64;
        this.valid_key_lengths = [32, 64];
        this.random_bytes = 8;
        if (this.options.laravel_key)
            console.log('DeprecationWarning: Laravel Encryptor, laravel_key is depreciated, please use key instead');
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
    ifSerialized_unserialize(decrypted, serialize) {
        return serialize ? Base_encryptor.unSerialize(decrypted) : decrypted;
    }
    hashIt(iv, encrypted) {
        const hmac = Base_encryptor.createHmac("sha256", this.secret);
        return hmac
            .update(Base_encryptor.setHmacPayload(iv, encrypted))
            .digest("hex");
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
exports.Base_encryptor = Base_encryptor;
