const {describe} = require('mocha');

const enc_test = require('./suites/encryptor.test');
const static_methods_test = require('./suites/encryptor.static.test');
const error_test = require('./suites/error.test');
const laravel = require('./suites/laravel.test');
const integrator = require('./suites/express.test');
const driver = require('./suites/serializer.test');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const key_128 = '1rAeZ/jidAbe13kSPO5s7g==';

describe('Testing node Laravel Encryptor', function() {
    describe('Test Encryptor Cipher/Decipher serialize_mode: Native JSON', enc_test.bind(this, 'json'));
    describe('Test Encryptor Cipher/Decipher serialize_mode: PHP Serialize', enc_test.bind(this, 'php'));
    describe('Test Encryptor static methods', static_methods_test.bind(this));
    describe('Test Encryptor Class Errors', error_test.bind(this));
    describe('Test Encryptor Class Serialize driver injection', driver.bind(this));
    describe(
        'Test Encryptor compatibility with Laravel Illuminate/Encryption/Encrypter AES-256-CBC',
        laravel.bind(this, 'AES-256-CBC', key)
    );
    describe(
        'Test Encryptor compatibility with Laravel Illuminate/Encryption/Encrypter AES-128-CBC',
        laravel.bind(this, 'AES-128-CBC', key_128)
    );
    describe('Test integration with Express cookie', integrator.bind(this));
});
