import {describe} from 'mocha';

import enc_test from './suites/encryptor.test';
import static_methods_test from './suites/encryptor.static.test';
import error_test from './suites/error.test';
import laravel from './suites/laravel.test';
import integrator from './suites/express.test';
import driver from './suites/serializer.test';


describe('Testing node Laravel Encryptor', function() {
    describe('Test Encryptor Cipher/Decipher serialize_mode: Native JSON', enc_test.bind(this, 'json'));
    describe('Test Encryptor Cipher/Decipher serialize_mode: PHP Serialize', enc_test.bind(this, 'php'));
    describe('Test Encryptor static methods', static_methods_test.bind(this));
    describe('Test Encryptor Class Errors', error_test.bind(this));
    describe('Test Encryptor Class Serialize driver injection', driver.bind(this));
    describe('Test Encryptor compatibility with Laravel Illuminate/Encryption/Encrypter', laravel.bind(this));
    describe('Test integration with Express cookie', integrator.bind(this));
});
