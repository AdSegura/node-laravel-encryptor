"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EncryptorError_1 = require("../lib/EncryptorError");
const Serialize = require('php-serialize');
class PhpSerializer {
    serialize(data) {
        return Serialize.serialize(data);
    }
    unSerialize(data) {
        if (!Serialize.isSerialized(data))
            return data;
        try {
            return Serialize.unserialize(data);
        }
        catch (e) {
            throw new EncryptorError_1.EncryptorError('phpUnSerialize Error unserialize data');
        }
    }
}
exports.PhpSerializer = PhpSerializer;
