"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serialize_1 = require("./Serialize");
const EncryptorError_1 = require("./EncryptorError");
let crypto;
try {
    crypto = require('crypto');
}
catch (e) {
    throw new EncryptorError_1.EncryptorError(e.message);
}
class Base_encryptor {
    constructor(options) {
        this.key_length = 64;
        this.valid_key_lengths = [32, 64];
        this.random_bytes = 8;
        this.default_serialize_mode = 'json';
        this.options = Object.assign({}, { serialize_mode: this.default_serialize_mode }, options);
        this.secret = Buffer.from(this.options.key, 'base64');
        this.serialize_driver = new Serialize_1.Serialize(this.options);
        this.setAlgorithm();
        this.random_bytes = this.options.random_bytes ? this.options.random_bytes : this.random_bytes;
    }
    setAlgorithm() {
        if (this.options.key_length && this.valid_key_lengths.indexOf(this.options.key_length) < 0)
            Base_encryptor.throwError('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
        this.algorithm = this.options.key_length ?
            `aes-${this.options.key_length * 4}-cbc` : `aes-${this.key_length * 4}-cbc`;
    }
    prepareData(data) {
        if (!data)
            Base_encryptor.throwError('You are calling Encryptor without data to cipher');
        data = Base_encryptor.ifNumberToString(data);
        return this.ifObjectToString(data);
    }
    decryptIt(payload) {
        payload = Base_encryptor.base64ToUtf8(payload);
        try {
            payload = JSON.parse(payload);
        }
        catch (e) {
            Base_encryptor.throwError('Encryptor decryptIt cannot parse json');
        }
        if (!Base_encryptor.validPayload(payload))
            Base_encryptor.throwError('The payload is invalid.');
        if (!this.validMac(payload))
            Base_encryptor.throwError('The MAC is invalid.');
        const decipherIv = this.createDecipheriv(payload.iv);
        const decrypted = Base_encryptor.cryptoDecipher(payload, decipherIv);
        return this.ifserialized_unserialize(decrypted);
    }
    static validPayload(payload) {
        return payload.hasOwnProperty('iv') && payload.hasOwnProperty('value') && payload.hasOwnProperty('mac')
            && Buffer.from(payload.iv, 'base64').toString('hex').length === 32;
    }
    validMac(payload) {
        try {
            const calculated = this.hashIt(payload.iv, payload.value);
            return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(payload.mac));
        }
        catch (e) {
            return false;
        }
    }
    encryptItSync(data) {
        const buf = crypto.randomBytes(this.random_bytes);
        const iv = buf.toString('hex');
        const cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);
        const value = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
        return this.generateEncryptedObject()({ iv, value });
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
        try {
            return crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(iv, 'base64'));
        }
        catch (e) {
            Base_encryptor.throwError(e.message);
        }
    }
    static cryptoDecipher(payload, decipher) {
        try {
            return decipher.update(payload.value, 'base64', 'utf8') + decipher.final('utf8');
        }
        catch (e) {
            Base_encryptor.throwError(e.message);
        }
    }
    ifserialized_unserialize(decrypted) {
        return this.serialize_driver.unSerialize(decrypted);
    }
    hashIt(iv, encrypted) {
        try {
            const hmac = Base_encryptor.createHmac("sha256", this.secret);
            return hmac
                .update(Base_encryptor.setHmacPayload(iv, encrypted))
                .digest("hex");
        }
        catch (e) {
            Base_encryptor.throwError(e.message);
        }
    }
    serialize(data) {
        return this.serialize_driver.serialize(data);
    }
    unserialize(data) {
        return this.serialize_driver.unSerialize(data);
    }
    static toBase64(data) {
        return Buffer.from(data).toString('base64');
    }
    static base64ToUtf8(data) {
        return Buffer.from(data, 'base64').toString('utf8');
    }
    static createHmac(alg, secret) {
        try {
            return crypto.createHmac(alg, secret);
        }
        catch (e) {
            Base_encryptor.throwError(e.message);
        }
    }
    static setHmacPayload(iv, encrypted) {
        return Buffer.from(iv + encrypted, 'utf-8');
    }
    static stringifyAndBase64(encrypted) {
        encrypted = JSON.stringify(encrypted);
        return Buffer.from(encrypted).toString('base64');
    }
    ifObjectToString(data) {
        return (typeof data === 'object') ? this.serialize(data) : data;
    }
    static ifNumberToString(data) {
        return (typeof data === 'number') ? data + '' : data;
    }
    static throwError(error) {
        if (error.name === 'EncryptorError')
            throw error;
        throw new EncryptorError_1.EncryptorError(error);
    }
    static generateRandomKey(length) {
        length = length ? length : 32;
        try {
            const buf = crypto.randomBytes(length);
            return buf.toString('base64');
        }
        catch (e) {
            Base_encryptor.throwError(e.message);
        }
    }
}
exports.Base_encryptor = Base_encryptor;
