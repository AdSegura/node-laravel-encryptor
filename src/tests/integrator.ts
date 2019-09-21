const {Cookie} = require("cookiejar");
const path = require('path');
const {ExpressServer} = require(path.resolve(__dirname + "/express-server"));
const uuid = require('uuid/v1');
const {describe, it} = require("mocha");
const {expect} = require("chai");
const chai = require("chai");
const chaiHttp = require('chai-http');
const {Encryptor} = require('../../');
const key = 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=';
const server_id = uuid();
const url = '/integrator';
const options = {
    async: true,
    cookie: 'cryptocookie',
    server_id,
    key,
    cookie_opt: {
        secure: false,
        httpOnly: false
    }
};

chai.use(chaiHttp);
const encryptor = new Encryptor({key});

/**
 * parse cookie
 *
 * @param response
 * @return {*}
 */
const decipher = (response) => {
    const cookieAccess = new Cookie();
    const cookie = cookieAccess.parse(response.res.headers['set-cookie'][0]);
    return encryptor.decrypt(decodeURIComponent(cookie.value));
};

export default function suite() {
    describe('Express Crypto Cookie Compatible with Laravel', function () {

        it('should create one request to Express aSync Mode, receive cookie and decipher', done => {

            options.async = true;
            const server = new ExpressServer(options);
            const requester = chai.request.agent(server).keepOpen();


            requester.get(url)
                .then(response => {
                    expect(decipher(response)).equals(server_id)
                })
                .then(() => {
                    requester.close();
                    done();
                })
        });

        it('should create one request to Express Sync Mode, receive cookie and decipher', done => {

            options.async = false;
            const server = new ExpressServer(options);
            const requester = chai.request.agent(server).keepOpen();

            requester.get(url)
                .then(response => {
                    expect(decipher(response)).equals(server_id)
                })
                .then(() => {
                    requester.close();
                    done();
                })
        });
    });
}

