"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encryptor_test_1 = require("./suites/encryptor.test");
const error_test_1 = require("./suites/error.test");
const laravel_test_1 = require("./suites/laravel.test");
const express_test_1 = require("./suites/express.test");
const mocha_1 = require("mocha");
mocha_1.describe('Testing node Laravel Encryptor', function () {
    mocha_1.describe('Test Encryptor Cipher and Decipher', encryptor_test_1.default.bind(this));
    mocha_1.describe('Test Encryptor Class Errors', error_test_1.default.bind(this));
    mocha_1.describe('Test Encryptor compatibility with Laravel Illuminate/Encryption/Encrypter', laravel_test_1.default.bind(this));
    mocha_1.describe('Test integration with express cookie', express_test_1.default.bind(this));
});
