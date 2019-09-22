"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EncryptorError_1 = require("./EncryptorError");
const jsonSerializer_1 = require("../serializers/jsonSerializer");
const phpSerializer_1 = require("../serializers/phpSerializer");
class Serializer {
    constructor(options) {
        this.options = options;
        if (!this.options.serialize_mode)
            this.options.serialize_mode = 'php';
        switch (this.options.serialize_mode) {
            case 'json': {
                this.driver = new jsonSerializer_1.JsonSerializer;
                break;
            }
            case 'php': {
                this.driver = new phpSerializer_1.PhpSerializer;
                break;
            }
            default: {
                throw new EncryptorError_1.EncryptorError(`Serializer Encryptor Class unknown option ${this.options.serialize_mode} serialize_mode`);
            }
        }
    }
    serialize(data) {
        if (!data)
            return;
        return this.driver.serialize(data);
    }
    unSerialize(data) {
        if (!data)
            return;
        return this.driver.unSerialize(data);
    }
}
exports.Serializer = Serializer;
