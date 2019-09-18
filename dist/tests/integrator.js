const {Cookie} = require("cookiejar");
const path = require('path');
const {ExpressServer} = require(path.resolve(__dirname + "/express-server"));
const uuid = require('uuid/v1');
const {describe, it} = require("mocha");
const {expect} = require("chai");
const chai = require("chai");
const chaiHttp = require('chai-http');
const {EncryptorSync} = require('../../');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const server_id = uuid();

const options = {
    cookie: 'cryptocookie',
    server_id,
    key
};

chai.use(chaiHttp);
const encryptor = new EncryptorSync({key});

const decipher = (response, unserialize) => {
    const cookieAccess = new Cookie();
    const cookie = cookieAccess.parse(response.res.headers['set-cookie'][0]);
    return encryptor.decrypt(decodeURIComponent(cookie.value), unserialize);
};

describe('Express Crypto Cookie Compatible with Laravel', function () {

    it('should create one request to Express aSync Mode, receive cookie and decipher',  done => {

        options.async = true;
        const server = new ExpressServer(options);
        const requester = chai.request.agent(server).keepOpen();


         requester.get('/')
            .then(response => {
                expect(decipher(response, false)).equals(server_id)
            })
            .then(() => {
                requester.close();
                done();
            })
    });

    it('should create one request to Express Sync Mode, receive cookie and decipher',  done => {

        options.async = false;
        const server = new ExpressServer(options);
        const requester = chai.request.agent(server).keepOpen();

        requester.get('/')
            .then(response => {
                expect(decipher(response, false)).equals(server_id)
            })
            .then(() => {
                requester.close();
                done();
            })
    });

    it('should create multiple requests to Express aSync Mode, receive cookie and decipher',  done => {

        options.async = true;
        const server = new ExpressServer(options);
        const requester = chai.request.agent(server).keepOpen();

        const promises = [
            requester.get('/'),requester.get('/')
        ];

        Promise.all(promises)
            .then(res => {
                res.map(response => {
                    expect(decipher(response, false)).equals(server_id)
                })
            })
            .then(() => {
                requester.close();
                done();
            })
    });

    it('should create multiple requests to Express Sync Mode, receive cookie and decipher',  done => {

        options.async = false;
        const server = new ExpressServer(options);
        const requester = chai.request.agent(server).keepOpen();

        const promises = [
            requester.get('/'),requester.get('/')
        ];

        Promise.all(promises)
            .then(res => {
                res.map(response => {
                    expect(decipher(response, false)).equals(server_id)
                })
            })
            .then(() => {
                requester.close();
                done();
            })
    });


    it('should create multiple requests to Express Sync Mode, receive cookie and decipher',  done => {

        options.async = false;
        const server = new ExpressServer(options);
        const requester = chai.request.agent(server).keepOpen();

        const promises = [
            requester.get('/'),requester.get('/')
        ];

        Promise.all(promises)
            .then(res => {
                res.map(response => {
                    expect(decipher(response, false)).equals(server_id)
                })
            })
            .then(() => {
                requester.close();
                done();
            })
    });
});

