"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LaravelEncryptor_1 = require("./LaravelEncryptor");
let laravelEncryptor = new LaravelEncryptor_1.LaravelEncryptor({
    laravel_key: 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=',
    key_length: 64
});
laravelEncryptor.encrypt('kokoa').then(enc => {
    console.log(enc);
    laravelEncryptor.decrypt(enc).then(enc => {
        console.log(enc);
    }).catch(e => {
        console.error(e);
    });
}).catch(e => {
    console.error(e);
});
