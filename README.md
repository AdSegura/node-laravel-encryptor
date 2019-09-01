# node-laravel-encryptor

NodeJS version of Laravel's 5.8 (and probably older versions) Encrypter Class
[Illuminate/Encryption/Encrypter.php](https://github.com/laravel/framework/blob/ad18538cd39a139d7aeee16c13062c8a4347141d/src/Illuminate/Encryption/Encrypter.php)

With this module you can create the encrypted payload for a cookie from Node Js
and be read by Laravel.
 
## Laravel Encrypter format:

Laravel only allows `AES-128-CBC` `AES-256-CBC`.
If no algorithm is defined default is `AES-256-CBC`

```json
{
  "iv":  "iv in base64",
  "value":  "encrypted data",
  "mac":  "Hash HMAC"
}
```
## Use

First we need to transpile code from TS to Js

```sh
$> npm run build 
```

This build command creates `dist/` directory
 
```js
import {LaravelEncryptor} from './dist'

let laravelEncryptor = new LaravelEncryptor({
    laravel_key: 'Laravel APP_KEY without base64:',
});

laravelEncryptor
    .encrypt('foo')
    .then(enc => console.log(enc));

laravelEncryptor
    .decrypt(enc)
    .then(dec => console.log(dec));
```

## Options 
##### Object  {laravel_key, key_length} 
* laravel_key: APP_KEY without `base64:`
* key_length: optional 32|64 for aes-[128]-cbc aes-[256]-cbc

if no `key_length` is given default is 64.

## Methods

### encrypt
arguments:
* data: string
* serialize: optional boolean, if data should be serialized before cipher

if no `serialize` option is given default is to serialize.

### decrypt
arguments:
* data: string
* serialize: optional boolean, if data should be unserialized after decipher

if no `serialize` option is given default is to unserialize.

# Tests

To be able to run PHP test you must have installed:

* PHP >= 7.1.3
* OpenSSL PHP Extension
* Mbstring PHP Extension
* Tokenizer PHP Extension
* Ctype PHP Extension
* JSON PHP Extension
* BCMath PHP Extension

If not, test number 7 will fail.

```sh
$> npm run build && npm run test

  node Laravel Encrypter
    ✓ should cipher and decipher
    ✓ should cipher and decipher with no key_length defined
    ✓ should cipher and decipher with no serialize nor unserialize
    ✓ should fail cipher not valid Laravel Key
    ✓ should fail cipher not valid algorithm
    ✓ should fail decipher not valid data
    ✓ should decipher data at Laravel correctly (51ms)


  7 passing (74ms)

```
