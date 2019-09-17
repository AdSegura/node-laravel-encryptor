const {CookieAccessInfo, Cookie} = require("cookiejar");

const path = require('path');
const {ExpressServer} = require(path.resolve(__dirname + "/express-server"));
const uuid = require('uuid/v1');
const {describe, it} = require("mocha");
const {expect} = require("chai");
const chai = require("chai");
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const exec = require('child_process').exec;
const text = 'resistance is futile';
const one_object = {foo: "bar"};
const {EncryptorSync} = require('../../');
const {Encryptor} = require('../../');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const encryptor = new Encryptor({key});
const server_id = uuid();
const options = {
    cookie: 'cryptocookie',
    server_id,
    key
};

describe('Express Crypto Cookie Compatible with Laravel', function () {

    it('should create a cookie and decipher',  done => {

        const server = new ExpressServer(options);
        const requester = chai.request.agent(server).keepOpen();
        const cookieAccess = new Cookie('localhost')

         requester.get('/')
            .then(response => {
                const cookie = cookieAccess.parse(response.res.headers['set-cookie'][0])
                //console.log(response.res.headers['set-cookie'][0])
                encryptor.decrypt(decodeURIComponent(cookie.value), false)
                    .then(res => {
                    expect(res).equals(server_id)
                })
            })
            .then(() => {
                requester.close();
                done();
            })
    });

});
