"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EncryptorError_1 = require("./EncryptorError");
const serialize = require('php-serialize');
class Serialize {
    constructor(options) {
        this.options = options;
        if (!this.options.serialize_mode)
            this.options.serialize_mode = 'json';
        switch (this.options.serialize_mode) {
            case 'json': {
                this.serialize = Serialize.jsonSerialize;
                this.unSerialize = Serialize.jsonUnSerialize;
                break;
            }
            case 'php': {
                this.serialize = Serialize.phpSerialize;
                this.unSerialize = Serialize.phpUnSerialize;
                break;
            }
            default: {
                throw new EncryptorError_1.EncryptorError(`Serialize Encryptor Class unknown option ${this.options.serialize_mode} serialize_mode`);
            }
        }
    }
    static jsonSerialize(data) {
        return JSON.stringify(data);
    }
    static jsonUnSerialize(data) {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return data;
        }
    }
    static phpSerialize(data) {
        return serialize.serialize(data);
    }
    static phpUnSerialize(data) {
        if (!serialize.isSerialized(data))
            return data;
        try {
            return serialize.unserialize(data);
        }
        catch (e) {
            throw new EncryptorError_1.EncryptorError('phpUnSerialize Error unserialize data');
        }
    }
}
exports.Serialize = Serialize;
