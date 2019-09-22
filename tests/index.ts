import enc_test from './suites/encryptor.test';
import error_test from './suites/error.test';
import laravel from './suites/laravel.test';
import integrator from './suites/express.test';
import {describe} from 'mocha';

describe('Testing node Laravel Encryptor', function() {
    describe('Test Encryptor Cipher and Decipher', enc_test.bind(this));
    describe('Test Encryptor Class Errors', error_test.bind(this));
    describe('Test Encryptor compatibility with Laravel Illuminate/Encryption/Encrypter', laravel.bind(this));
    describe('Test integration with express cookie', integrator.bind(this));
});
