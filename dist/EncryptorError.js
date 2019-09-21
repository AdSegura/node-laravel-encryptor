"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EncryptorError extends Error {
    constructor(args) {
        super(args);
        this.name = "EncryptorError";
    }
}
exports.EncryptorError = EncryptorError;
