"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serialize = require('php-serialize');
const crypto = require('crypto');
const debug = require('debug')('LaravelEncryptor');
class LaravelEncryptor {
    constructor(options) {
        this.options = options;
        this.key_length = 64;
        this.valid_key_lengths = [32, 64];
        this.errors = [];
        debug(`constructor options: ${JSON.stringify(this.options)}\n`);
        this.setAlgorithm();
        debug('algorithm: ' + this.algorithm);
        this.secret = Buffer.from(this.options.laravel_key, 'base64');
    }
    setAlgorithm() {
        if (this.options.key_length && this.valid_key_lengths.indexOf(this.options.key_length) < 0)
            this.errors.push(new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.'));
        this.algorithm = this.options.key_length ?
            `aes-${this.options.key_length * 4}-cbc` : `aes-${this.key_length * 4}-cbc`;
    }
    encrypt(data, serialize) {
        if (this.is_there_any_errors())
            return Promise.reject(this.returnError());
        serialize = (serialize !== undefined) ? serialize : true;
        debug(`Encrypt, data to encrypt: ${data}, serialize: ${serialize}\n`);
        const payload = serialize ? this.serialize(data) : data;
        return new Promise((resolve, reject) => {
            this.encryptIt(payload).then(encrypted => {
                encrypted.mac = this.hashIt(encrypted);
                encrypted = JSON.stringify(encrypted);
                encrypted = this.toBase64(encrypted);
                debug(`EncryptIt data encrypted: ${JSON.stringify(encrypted)}\n`);
                return resolve(encrypted);
            }).catch(e => {
                reject(e);
            });
        });
    }
    decrypt(data, serialize) {
        if (this.is_there_any_errors())
            return Promise.reject(this.returnError());
        return new Promise((resolve, reject) => {
            this.decryptIt(data, serialize).then(decrypted => {
                return resolve(decrypted);
            }).catch(e => {
                reject(e);
            });
        });
    }
    decryptIt(payload, serialize) {
        serialize = (serialize !== undefined) ? serialize : true;
        debug(`decryptIt, data to decrypt: ${payload}, unserialize: ${serialize}\n`);
        return new Promise((resolve, reject) => {
            payload = this.base64ToUtf8(payload);
            try {
                payload = JSON.parse(payload);
            }
            catch (e) {
                return reject(e);
            }
            debug(`DecryptIt payload AFTER base64ToUtf8 and JSON.parse ${JSON.stringify(payload)}\n`);
            this.createDecipheriv(payload.iv).then(_ => {
                let decrypted = this.deCipher.update(payload.value, 'base64', 'utf8') + this.deCipher.final('utf8');
                decrypted = serialize ? this.unSerialize(decrypted) : decrypted;
                debug(`DecryptIt final payload: ${decrypted}`);
                resolve(decrypted);
            }).catch(e => {
                return reject(e);
            });
        });
    }
    encryptIt(data) {
        return new Promise((resolve, reject) => {
            this.createCypher().then(iv => {
                let encrypted = this.cipher.update(data, 'utf8', 'base64') + this.cipher.final('base64');
                resolve({ iv: this.toBase64(iv), value: encrypted });
            }).catch(e => {
                return reject(e);
            });
        });
    }
    createCypher() {
        return new Promise((resolve, reject) => {
            this.generate_iv().then(iv => {
                try {
                    this.cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);
                    resolve(iv);
                }
                catch (e) {
                    reject(e);
                }
            }).catch(e => {
                return reject(e);
            });
        });
    }
    createDecipheriv(iv) {
        return new Promise((resolve, reject) => {
            try {
                this.deCipher = crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(iv, 'base64'));
                resolve(true);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    generate_iv() {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buffer) => {
                if (err)
                    return reject(err);
                resolve(buffer.toString('hex').slice(0, 16));
            });
        });
    }
    serialize(data) {
        return Serialize.serialize(data);
    }
    unSerialize(data) {
        return Serialize.unserialize(data);
    }
    toBase64(data) {
        let buff = Buffer.from(data);
        return buff.toString('base64');
    }
    base64ToUtf8(data) {
        let buff = Buffer.from(data, 'base64');
        return buff.toString('utf8');
    }
    hashIt(payload) {
        let hmac = crypto.createHmac("sha256", this.secret);
        return hmac.update(Buffer.from(payload.iv + payload.value, 'utf-8')).digest("hex");
    }
    is_there_any_errors() {
        return this.errors.length >= 1;
    }
    returnError() {
        return this.errors[0];
    }
}
exports.LaravelEncryptor = LaravelEncryptor;
