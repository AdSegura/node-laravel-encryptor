import {LaravelEncryptor} from './LaravelEncryptor'

let laravelEncryptor = new LaravelEncryptor({
    laravel_key: 'LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o=',
    key_length: 64
})

laravelEncryptor.encrypt('kokoa').then(enc => {
    console.log(enc)
    laravelEncryptor.decrypt(enc).then(enc => {
        console.log(enc)
    }).catch(e => {
        console.error(e)
    })
}).catch(e => {
    console.error(e)
})


