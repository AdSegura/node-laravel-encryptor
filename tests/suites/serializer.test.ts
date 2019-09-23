const {it} = require("mocha");
const {expect} = require("chai");
const {Encryptor} = require('../../dist');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';

export default function suite() {

    it('should inject custom serializer driver in constructor', done => {
        const cipher = new Encryptor({key}, require('../lib/mockDriver'));
        expect(cipher.serialize_driver.driver.constructor.name)
            .equal('MockDriver');
        done()
    });

    it('should inject custom serializer driver at runtime', done => {
        const cipher = new Encryptor({key});
        cipher.setSerializerDriver(require('../lib/mockDriver'));
        expect(cipher.serialize_driver.driver.constructor.name)
            .equal('MockDriver');
        done()
    });
}
