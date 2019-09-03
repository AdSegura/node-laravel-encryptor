"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LaravelEncryptor_1 = require("./LaravelEncryptor");
const http = require('http');
let laravelEncryptor = new LaravelEncryptor_1.LaravelEncryptor({
    laravel_key: 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=',
    key_length: 64
});
let data;
data = { foo: 1 };
if (process.argv[2])
    data = JSON.parse(process.argv[2]);
laravelEncryptor.encrypt(data).then(enc => {
    console.log(enc);
    const req = http.request(options(enc), res => {
        console.log(`statusCode: ${res.statusCode}`);
        res.on('data', d => {
            console.log('ON DATA');
            process.stdout.write(d);
        });
    });
    req.on('error', error => {
        console.error(error);
    });
    req.end();
    laravelEncryptor.decrypt(enc).then(enc => {
        console.log(enc);
    }).catch(e => {
        console.error(e);
    });
}).catch(e => {
    console.error(e);
});
const options = (enc) => {
    return {
        hostname: 'localhost',
        port: 8000,
        path: '/cookie',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `echoserver=${enc}`
        }
    };
};
