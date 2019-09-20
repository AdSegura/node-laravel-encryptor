"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serialize = require('php-serialize');
const crypto = require('crypto');
class Base_encryptor {
    constructor(options) {
        this.options = options;
        this.key_length = 64;
        this.valid_key_lengths = [32, 64];
        if (this.options.laravel_key)
            console.log('DeprecationWarning: Laravel Encryptor, laravel_key is depreciated, please use key instead');
        const key = this.options.laravel_key ? this.options.laravel_key : this.options.key;
        this.setAlgorithm();
        this.secret = Buffer.from(key, 'base64');
        this.random_bytes = this.options.random_bytes ? this.options.random_bytes : 8;
    }
    setAlgorithm() {
        if (this.options.key_length && this.valid_key_lengths.indexOf(this.options.key_length) < 0)
            throw new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
        this.algorithm = this.options.key_length ?
            `aes-${this.options.key_length * 4}-cbc` : `aes-${this.key_length * 4}-cbc`;
    }
    decryptIt(payload) {
        payload = Base_encryptor.base64ToUtf8(payload);
        try {
            payload = JSON.parse(payload);
        }
        catch (e) {
            throw new Error('Encryptor decripIt cannot parse json');
        }
        const decipherIv = this.createDecipheriv(payload.iv);
        const decrypted = Base_encryptor.cryptoDecipher(payload, decipherIv);
        return Base_encryptor.ifSerialized_unserialize(decrypted);
    }
    generateEncryptedObject() {
        return ({ iv, value }) => {
            iv = Base_encryptor.toBase64(iv);
            return {
                iv,
                value,
                mac: this.hashIt(iv, value)
            };
        };
    }
    createDecipheriv(iv) {
        return crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(iv, 'base64'));
    }
    static cryptoDecipher(payload, decipher) {
        return decipher.update(payload.value, 'base64', 'utf8') + decipher.final('utf8');
    }
    static prepareData(data) {
        if (!data)
            throw new Error('You are calling Encryptor without data to cipher');
        data = Base_encryptor.ifNumberToString(data);
        return Base_encryptor.ifObjectToString(data);
    }
    static ifSerialized_unserialize(decrypted) {
        return Base_encryptor.isSerialized(decrypted) ? Base_encryptor.unSerialize(decrypted) : decrypted;
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
    static isSerialized(data) {
        return Serialize.isSerialized(data);
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
    static ifObjectToString(data) {
        return (typeof data === 'object') ? Base_encryptor.serialize(data) : data;
    }
    static ifNumberToString(data) {
        return (typeof data === 'number') ? data + '' : data;
    }
    static generateRandomKey(length) {
        length = length ? length : 32;
        const buf = crypto.randomBytes(length);
        return buf.toString('base64');
    }
}
exports.Base_encryptor = Base_encryptor;
