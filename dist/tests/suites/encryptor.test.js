"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { describe, it } = require("mocha");
const { expect } = require("chai");
const exec = require('child_process').exec;
const { Encryptor } = require('../../');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const text = 'resistance is futile';
const one_object = { foo: "bar" };
const cipher = new Encryptor({ key });
const decipher = (data) => {
    return cipher.decrypt(data);
};
function suite() {
    it('should generate a valid key', done => {
        const randomKey = Encryptor.generateRandomKey();
        const encryptor = new Encryptor({ key: randomKey });
        encryptor
            .encrypt(text)
            .then(enc => {
            const dec = encryptor.decrypt(enc);
            expect(dec).equal(text);
            done();
        });
    });
    it('should cipher and decipher', done => {
        const encryptor = new Encryptor({ key, key_length: 64 });
        encryptor
            .encrypt(text)
            .then(enc => {
            const dec = encryptor.decrypt(enc);
            expect(dec).equal(text);
            done();
        });
    });
    it('should cipher and decipher object without serialize or stringify object', done => {
        const encryptor = new Encryptor({ key });
        encryptor
            .encrypt(one_object)
            .then(res => {
            expect(decipher(res)).to.have.property('foo').equals('bar');
            done();
        });
    });
    it('should cipher and decipher with no key_length defined', done => {
        const encryptor = new Encryptor({
            key
        });
        encryptor
            .encrypt(text)
            .then(enc => {
            const dec = encryptor.decrypt(enc);
            expect(dec).equal(text);
            done();
        });
    });
    it('should cipher and decipher a number', done => {
        const number = 1;
        const encryptor = new Encryptor({
            key
        });
        encryptor
            .encrypt(number)
            .then(enc => {
            const dec = encryptor.decrypt(enc);
            expect(parseInt(dec)).equal(number);
            done();
        });
    });
    it('should cipher and decipher Sync Mode', done => {
        const encryptor = new Encryptor({ key });
        let enc = encryptor.encryptSync(text);
        let dec = encryptor.decrypt(enc);
        expect(dec).equal(text);
        done();
    });
}
exports.default = suite;
