"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tests_1 = require("./tests");
const integrator_1 = require("./integrator");
describe('Testing node Laravel Encryptor', function () {
    describe('Test Encryptor Class', tests_1.default.bind(this));
    describe('Test integration with express cookie', integrator_1.default.bind(this));
});
