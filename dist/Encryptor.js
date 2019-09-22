"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_encryptor_1 = require("./base_encryptor");
const EncryptorError_1 = require("./lib/EncryptorError");
class Encryptor extends base_encryptor_1.Base_encryptor {
    constructor(options) {
        super(options);
    }
    encrypt(data, force_serialize) {
        if (!data)
            throw new EncryptorError_1.EncryptorError('encrypt no data given');
        const payload = this.prepareDataToCipher(data, force_serialize);
        return this
            .encryptIt(payload)
            .then(Encryptor.stringifyAndBase64, Encryptor.throwError);
    }
    encryptSync(data, force_serialize) {
        if (!data)
            throw new EncryptorError_1.EncryptorError('encryptSync no data given');
        const payload = this.prepareDataToCipher(data, force_serialize);
        return Encryptor.stringifyAndBase64(this.encryptItSync(payload));
    }
    decrypt(data) {
        if (!data)
            throw new EncryptorError_1.EncryptorError('decrypt no data given');
        const payload = this.prepareDataToDecipher(data);
        return this.decryptIt(payload);
    }
    static static_decipher(key, data, serialize_mode) {
        if (!key)
            throw new EncryptorError_1.EncryptorError('static_decipher no key given');
        if (!data)
            throw new EncryptorError_1.EncryptorError('static_decipher no data given');
        const encrypt = new Encryptor({ key });
        return encrypt.decrypt(data);
    }
    static static_cipher(key, data, serialize_mode, cb) {
        if (!key)
            throw new EncryptorError_1.EncryptorError('static_cipher no key given');
        if (!data)
            throw new EncryptorError_1.EncryptorError('static_cipher no data given');
        const encrypt = new Encryptor({ key });
        if (typeof cb === 'function') {
            encrypt.encrypt(data)
                .then(enc => cb(null, enc))
                .catch(e => cb(e));
        }
        else {
            return encrypt.encryptSync(data);
        }
    }
}
exports.Encryptor = Encryptor;
