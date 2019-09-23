"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Serializer_1 = require("./lib/Serializer");
const EncryptorError_1 = require("./lib/EncryptorError");
const phpSerializer_1 = require("./serializers/phpSerializer");
const jsonSerializer_1 = require("./serializers/jsonSerializer");
let crypto;
try {
    crypto = require('crypto');
}
catch (e) {
    throw new EncryptorError_1.EncryptorError(e.message);
}
class Base_encryptor {
    constructor(options, driver) {
        this.key_length = 64;
        this.valid_key_lengths = [32, 64];
        this.random_bytes = 8;
        this.default_serialize_mode = 'php';
        this.options = Object.assign({}, { serialize_mode: this.default_serialize_mode }, options);
        this.setSerializerDriver(driver);
        this.setAlgorithm();
        this.secret = Base_encryptor.prepareAppKey(this.options.key);
        this.random_bytes = this.options.random_bytes ? this.options.random_bytes : this.random_bytes;
    }
    encryptIt(data) {
        return this
            .generate_iv()
            .then(this.createCypherIv())
            .then(this.cipherIt(data))
            .then(this.generateEncryptedObject());
    }
    encryptItSync(data) {
        const iv = this.generate_iv_sync();
        const cipher = this.createCipher(iv);
        const value = Base_encryptor.cryptoUpdate(cipher, data);
        return this.generateEncryptedObject()({ iv, value });
    }
    decryptIt(encrypted) {
        let payload;
        try {
            payload = JSON.parse(encrypted);
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
        if (process.env.NODE_ENV === 'test')
            this.raw_decrypted = decrypted;
        return this.ifserialized_unserialize(decrypted);
    }
    static prepareAppKey(key) {
        if (!key)
            Base_encryptor.throwError('no app key given');
        return Buffer.from(key, 'base64');
    }
    setSerializerDriver(driver) {
        if (driver) {
            if (!Base_encryptor.validateSerializerDriver(driver))
                Base_encryptor.throwError('validateSerializerDriver');
            this.serialize_driver = new Serializer_1.Serializer(new driver);
            this.options.serialize_mode = 'custom';
        }
        else {
            this.serialize_driver = new Serializer_1.Serializer(this.pickSerializeDriver());
        }
    }
    static validateSerializerDriver(driver) {
        try {
            const custom_driver = new driver;
            return Base_encryptor
                .validateSerializerImplementsSerializerInterface(custom_driver);
        }
        catch (e) {
            Base_encryptor.throwError('validateSerializerDriver');
        }
    }
    static validateSerializerImplementsSerializerInterface(driver) {
        return (typeof driver['serialize'] === 'function')
            && (typeof driver['unSerialize'] === 'function');
    }
    pickSerializeDriver() {
        if (!this.options.serialize_mode)
            this.options.serialize_mode = 'php';
        switch (this.options.serialize_mode) {
            case 'json': {
                return new jsonSerializer_1.JsonSerializer;
            }
            case 'php': {
                return new phpSerializer_1.PhpSerializer;
            }
            default: {
                throw new EncryptorError_1.EncryptorError(`Serializer Encryptor Class unknown option ${this.options.serialize_mode} serialize_mode`);
            }
        }
    }
    setAlgorithm() {
        if (this.options.key_length && this.valid_key_lengths.indexOf(this.options.key_length) < 0)
            Base_encryptor.throwError('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');
        this.algorithm = this.options.key_length ?
            `aes-${this.options.key_length * 4}-cbc` : `aes-${this.key_length * 4}-cbc`;
    }
    prepareDataToCipher(data, force_serialize) {
        if (force_serialize === true && this.serialize_driver.getDriverName() === 'PhpSerializer') {
            return this.serialize_driver.serialize(data);
        }
        data = Base_encryptor.ifNumberToString(data);
        return this.ifObjectToString(data);
    }
    prepareDataToDecipher(data) {
        return Base_encryptor.base64ToUtf8(data);
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
    static cryptoUpdate(cipher, data) {
        try {
            return cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
        }
        catch (e) {
            Base_encryptor.throwError(e.message);
        }
    }
    createCipher(iv) {
        try {
            return crypto.createCipheriv(this.algorithm, this.secret, iv);
        }
        catch (e) {
            Base_encryptor.throwError(e.message);
        }
    }
    createCypherIv() {
        return (iv) => {
            return { iv, cipher: this.createCipher(iv) };
        };
    }
    cipherIt(data) {
        return ({ iv, cipher }) => {
            return {
                iv,
                value: Base_encryptor.cryptoUpdate(cipher, data)
            };
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
    generate_iv_sync() {
        try {
            const buf = crypto.randomBytes(this.random_bytes);
            return buf.toString('hex');
        }
        catch (e) {
            Base_encryptor.throwError('generate_iv_sync error generating random bytes');
        }
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
        if (typeof data !== 'string')
            throw new EncryptorError_1.EncryptorError('base64ToUtf8 Error data arg not a string');
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
        const payload = JSON.stringify(encrypted);
        return Buffer.from(payload).toString('base64');
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
        length = length ? length : Base_encryptor.app_key_length;
        try {
            const buf = crypto.randomBytes(length);
            return buf.toString('base64');
        }
        catch (e) {
            Base_encryptor.throwError(e.message);
        }
    }
    getRawDecrypted() {
        return this.raw_decrypted;
    }
}
Base_encryptor.app_key_length = 32;
exports.Base_encryptor = Base_encryptor;
