# node-laravel-encryptor

NodeJS version of Laravel's Encrypter Class, tested 5.4.30 to 6.0 
[Illuminate/Encryption/Encrypter.php](https://github.com/laravel/framework/blob/ad18538cd39a139d7aeee16c13062c8a4347141d/src/Illuminate/Encryption/Encrypter.php)

With this module you can create the encrypted payload for a cookie from Node Js
and be read by Laravel.

You can use it too as standalone module to encrypt and decrypt data with verified signature.
 
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
## Install
```sh
$> npm i node-laravel-encryptor
```

## Use Async mode
```js
const {Encryptor} = require('node-laravel-encryptor');

let encryptor = new Encryptor({
    key: 'Laravel APP_KEY without base64:',
});

encryptor
    .encrypt({foo: 'bar'})
    .then(enc => console.log(encryptor.decrypt(enc)));
```

## Use Sync mode
```js
const enc = encryptor.encryptSync({foo: 'bar'});

console.log(encryptor.decrypt(enc));
```

Decrypt is always in sync mode.

## Options 
###### Object  {key, key_length} 
* key: APP_KEY without `base64:` 
* key_length: optional 32|64 for aes-[128]-cbc aes-[256]-cbc

if no `key_length` is given default is 64.

## Methods

### encrypt
arguments:
* data: string|object|number
* return base64 string
* throw EncryptorError

### decrypt
arguments:
* data: string|object|number
* return string|object
* throw EncryptorError


Encrypt and Decrypt methods will serialize or unserialize data if needed.

# Tests

```sh
$> npm run test
```
To be able to run PHP test you must have installed:

* PHP >= 7.1.3
* OpenSSL PHP Extension
* Mbstring PHP Extension
* Tokenizer PHP Extension
* Ctype PHP Extension
* JSON PHP Extension
* BCMath PHP Extension

```sh
$> npm run test

  Testing node Laravel Encryptor
    Test Encryptor Class
      Test what type of Errors throw Encryptor
        ✓ should throw EncryptorError Error Type
      Test Encryptor Errors
        ✓ should throw Error when data to encrypt is null
        ✓ should throw Error when cipher with not valid Key
        ✓ should throw Error when cipher with not valid algorithm
        ✓ should throw Error when decipher not valid Json
        ✓ should throw Error when decipher invalid MAC signature
        ✓ should throw Error when decipher with invalid Payload
        ✓ should throw Error when decipher with invalid iv length
      Test Encryptor Cipher and Decipher 
        ✓ should cipher and decipher
        ✓ should cipher and decipher object without serialize or stringify object
        ✓ should cipher and decipher with no key_length defined
        ✓ should cipher and decipher a number
        ✓ should cipher and decipher Sync Mode
      Test Encryptor compatibility with Laravel Illuminate/Encryption/Encrypter
        ✓ should decipher data at Laravel correctly (49ms)
        ✓ should decipher from Laravel correctly (49ms)
        ✓ should decipher data, Sync Mode, at Laravel correctly (51ms)
    Test integration with express cookie
      Express Crypto Cookie Compatible with Laravel
        ✓ should create one request to Express aSync Mode, receive cookie and decipher (38ms)
        ✓ should create one request to Express Sync Mode, receive cookie and decipher


  18 passing (247ms)

```

# Artillery test

In order to run Artillery integration test and stress test with aSync|Sync mode we have 

to [install artillery](https://artillery.io/docs/getting-started/) and artillery expect plugin.

```bash
$> npm install -g artillery artillery-plugin-expect
```
## Run Artillery expect test

#### start server running in async mode
```bash
$> npm run artillery_server_async
```

```bash
$> npm run artillery_expect
```

```bash
All virtual users finished
Summary report @ 11:28:45(+0200) 2019-09-21
  Scenarios launched:  110
  Scenarios completed: 110
  Requests completed:  1100
  RPS sent: 105.77
  Request latency:
    min: 0.8
    max: 14.4
    median: 1.2
    p95: 2
    p99: 3.5
  Scenario counts:
    Integration Test, parallel request: 110 (100%)
  Codes:
    200: 1100
```

#### start server running in sync mode
```bash
$> npm run artillery_server_sync
```

```bash
$> npm run artillery_expect
```

```bash
All virtual users finished
Summary report @ 11:31:09(+0200) 2019-09-21
  Scenarios launched:  110
  Scenarios completed: 110
  Requests completed:  1100
  RPS sent: 105.87
  Request latency:
    min: 1
    max: 27.3
    median: 1.4
    p95: 2.2
    p99: 3.9
  Scenario counts:
    Integration Test, parallel request: 110 (100%)
  Codes:
    200: 1100
```

## Run Artillery stress test

#### start server running in async mode
```bash
$> npm run artillery_server_async
```

#### start server running in sync mode
```bash
$> npm run artillery_server_sync
```

#### run test
```bash
$> npm run artillery
```

#### Async Mode
```sh
All virtual users finished
Summary report @ 11:20:34(+0200) 2019-09-21
  Scenarios launched:  4220
  Scenarios completed: 4220
  Requests completed:  4220
  RPS sent: 17.52
  Request latency:
    min: 1.1
    max: 30.3
    median: 1.9
    p95: 3
    p99: 4.8
  Scenario counts:
    stress test: 4220 (100%)
  Codes:
    200: 4220
```

#### Sync Mode
```sh
All virtual users finished
Summary report @ 11:15:31(+0200) 2019-09-21
  Scenarios launched:  4220
  Scenarios completed: 4220
  Requests completed:  4220
  RPS sent: 17.52
  Request latency:
    min: 1.1
    max: 30.6
    median: 1.9
    p95: 2.9
    p99: 4.7
  Scenario counts:
    stress test: 4220 (100%)
  Codes:
    200: 4220
```

### [Dont block the event loop](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)
>Blocking the Event Loop: Node core modules
> 
> Several Node core modules have synchronous expensive APIs, including:
>  
>      Encryption
>      Compression
>      File system
>      Child process
>  
>  These APIs are expensive, because they involve significant computation (encryption, compression), require I/O (file I/O), or potentially both (child process). These APIs are intended for scripting convenience, but are not intended for use in the server context. If you execute them on the Event Loop, they will take far longer to complete than a typical JavaScript instruction, blocking the Event Loop.
>  
>  ### In a server, you should not use the following synchronous APIs from these modules:
>  
>      Encryption:
>          crypto.randomBytes (synchronous version)
 
