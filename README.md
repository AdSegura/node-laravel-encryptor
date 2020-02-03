[![Build Status](https://travis-ci.org/AdSegura/node-laravel-encryptor.svg?branch=master)](https://travis-ci.org/AdSegura/node-laravel-encryptor)
[![npm version](https://badge.fury.io/js/node-laravel-encryptor.svg)](https://badge.fury.io/js/node-laravel-encryptor)
[![node version](https://badgen.net/badge/node/%3E=8.10.0/green)](https://badgen.net/badge/node/%3E=8.10.0/green)
# node-laravel-encryptor

NodeJS version of Laravel's Encrypter Class, tested 5.4.30 to 6.X
[Illuminate/Encryption/Encrypter.php](https://github.com/laravel/framework/blob/ad18538cd39a139d7aeee16c13062c8a4347141d/src/Illuminate/Encryption/Encrypter.php)

With this module you can create the encrypted payload for a cookie from Node Js
and be read by Laravel.

You can use it too as standalone module to encrypt and decrypt data with verified signature.

If you use this module as standalone, AKA without Laravel
backend involve in your scenarios you can use native `node JSON lib` to serialize
the data before ciphering it.

## Prerequisites
* NodeJs `>=v8.10.0 (npm v5.6.0)`

## Laravel Compatibility
* Laravel `>=5.4.30`

## Install
```sh
$> npm i node-laravel-encryptor
```

## Use 
### Async mode
```js
const {Encryptor} = require('node-laravel-encryptor');

let encryptor = new Encryptor({
    key: 'Laravel APP_KEY without base64:',
});

encryptor
    .encrypt({foo: 'bar'})
    .then(enc => console.log(encryptor.decrypt(enc)));
```

### Sync mode
```js
const enc = encryptor.encryptSync({foo: 'bar'});

console.log(encryptor.decrypt(enc));
```

Decrypt is always in sync mode.

## Serialize `<php>`|`<json>`|`<custom>`

Encryptor let you chose between `php-serialize` npm package or `JSON` node native implementation to serialize the data out of the box.

If you need to use other serialize library, like `mspack` or any other custom lib, Encryptor let you inject, at the constructor or at runtime with 
`setSerializerDriver(your_lib)`, your custom Serializer Class. 

> If you use this module with the intend to be able **to read and write ciphered data to/from Laravel** you should instance Encryptor class without any `serialize_mode` option, just the defaults.

> If you use this module **without any Laravel Backend involve** you should use json mode, instance Encryptor class with `serialize_mode:'json'`.

Encryptor will serialize only if data to cipher is an object.

You can ***force serialize*** if Encryptor class is using `serialize_mode:'php'` to be able to serialize data to send back to Laravel if needed

##### Use php-serialize to serialize data (Laravel integration)
```js
const encryptor  = new Encryptor({key});
const encryptor1 = new Encryptor({key, serialize_mode: 'php'});
```
encryptor and encryptor1 just do the same, initialize Encryptor class with serialize mode to `'php'`

> Encryptor defaults serialize data with `php-serialize` driver to be compliant with Laravel 

##### Force serialize only when `serialize_mode:'php'` 
If data needs to be serialized but it's not an object (because Laravel is serializing everything) 
you can force `Encryptor.encrypt()` to serialize data.
```js
const encryptor  = new Encryptor({key}); //serialize_mode = 'php'
encryptor.encrypt('foo', true) //foo now is encrypted and serialized
```   

##### Use JSON to serialize data
```js
const encryptor = new Encryptor({key, serialize_mode: 'json'});
```

#### Write your custom Serializer
#### Prerequisites
* adhere to Serializer Interface contract

Your custom Serializer must implement this two methods:

```ts
export interface Serialize_Interface {
     serialize(data: any): string;
     unSerialize(data: string): any;
}
``` 

## Encryptor Class 
#### Constructor
* arguments:
    * options: `<object>` {key, key_length} 
        * key: `<string>` APP_KEY without `base64:` 
        * key_length: `<number>` [optional] [default] `<256>` values 128|256 for aes-[128]-cbc aes-[256]-cbc
        * serialize_mode: `<string>` [optional] [default] `<php>` values `<php>`|`<json>`
    * serialize driver: `class to serialize` [optional] 
* throw EncryptorError

##### options.key_length
If you use aes-128-cbc value should be 128
If you use aes-256-cbc value should be 256 or you can omit, it's a default value.

### Methods
#### encrypt(data, force_serialize)
> Will encrypt data with MAC signature, and return a Promise with encrypted base64 string.

With `force_serialize` (only apply with `serialize_mode:'php'`) you can force Encryptor to serialize data 
before cipher even if data is not an object.
    
`force_serialize`, will not take any effect if Encryptor is using other serializer driver than `php-serialize` module.  
* arguments:
    * data: `<string>`|`<object>`|`<number>`
    * force_serialize: `<boolean>` [optional] 
* return Promise `<string>` base64 json encoded object `{iv, value, mac}`
* throw EncryptorError

#### decrypt(data)
> Will decrypt data with MAC signature verification, and return original data.
* arguments:
    * data: `<string>`|`<object>`|`<number>`
* return `<string>`|`<object>`
* throw EncryptorError

#### encryptSync(data, force_serialize)
> Will encrypt data with MAC signature, and return encrypted base64 string.

With `force_serialize` (only apply with `serialize_mode:'php'`) you can force Encryptor to serialize data 
before cipher even if data is not an object.
    
`force_serialize`, will not take any effect if Encryptor is using other serializer driver than `php-serialize` module.
* arguments:
    * data: `<string>`|`<object>`|`<number>`
    * force_serialize: `<boolean>` [optional] 
* return `<string>` base64 json encoded object `{iv, value, mac}`
* throw EncryptorError

Encrypt and Decrypt methods will serialize or unserialize data if needed.

#### setSerializerDriver(custom_Serializer_lib)
> Will inject custom serializer driver to Encryptor Class
* arguments:
    * custom_Serializer_lib: `object class serialize module` 
* return `<void>`
* throw EncryptorError

#### Static generateRandomKey()
> Will generate valid App_key a la Laravel
* arguments:
    * length: `<number>` [optional], default 256, if you use aes-128-cbc use 128   
* return `<string>` base64
* throw EncryptorError

#### Static static_decipher(key, data)
> will decipher data
* arguments:
    * key:  `<string>` base64 encoded key
    * data: `<string>`|`<object>`|`<number>`
* return `<string>` base64
* throw EncryptorError

#### Static static_cipher(key, data, [cb])
> will cipher data
* arguments:
    * key:  `<string>` base64 encoded key
    * data: `<string>`|`<object>`|`<number>`
    * cb:   `<function>` optional callback
* return `<string>` base64
* throw EncryptorError

#### Binary node_modules/.bin/encryptor
```bash
➜ encryptor      
Usage
  encryptor --gen [128, 256]
  encryptor --enc --key <key> --value <value> [--serialize_mode json|php]
  encryptor --dec --key <key> --value <value> [--serialize_mode json|php]
```

##### Generate cipher key
```bash
➜ encryptor --gen 256             
qS+rK37YXXCYHXUhYaQtFGE+RMRQHiolxTilCre4/xQ=

➜ encryptor --gen 128             
qc5plfoS13rfJeQ9LcqNtg==
```

##### Cipher
```bash
➜ encryptor --enc --key '5mimovgZ4oxbEoktPRKpVlu8LUL6JZRJb1+Y5JzJkIc=' \
--value '{"foo": 1}' --serialize_mode json

[OPTIONS]
  [key] => 5mimovgZ4oxbEoktPRKpVlu8LUL6JZRJb1+Y5JzJkIc=
  [value] => {"foo": 1}
  [serialize_mode] => json

[OUTPUT]
  [ciphered] => eyJpdiI6Ill6UTJOakV5WWpOa1lXUTNNRFkyTnc9PSIsInZhbHVlIjoiYjVtTE9GeDZ2QWhIRkRrUjIwWGhlQT09IiwibWFjIjoiNjUzNDQzNzRmYzUwZmY4NTdjNGY4MDdiZjcwZmFjMzU1YzlmYzU4MTQ1NmQ2MmYxY2I3ZDdiYWIwYTFmZWExMiJ9
```

###### without serialize_mode (default php)
```bash
➜ encryptor --enc --key '5mimovgZ4oxbEoktPRKpVlu8LUL6JZRJb1+Y5JzJkIc=' \
--value '{"foo": 1}'                      

[OPTIONS]
  [key] => 5mimovgZ4oxbEoktPRKpVlu8LUL6JZRJb1+Y5JzJkIc=
  [value] => {"foo": 1}
  [serialize_mode] => php

[OUTPUT]
  [ciphered] => eyJpdiI6Ik5EWmlaR0ZpTjJabFpEZGxOVFJrTmc9PSIsInZhbHVlIjoiYmo3RXJPMnNOamljamJITDMxZTVzcWxlUnpzN0RJdnZ4RUVpNTVvWlVKWT0iLCJtYWMiOiI2YjY4OGRiYjc0ZTg4NzlhMWYxMzI1MmZiOGY3Y2Q4YzM1MGEzMWUyZWE3ZWM3NjRmZTkyZTAwNGZkZGUyMmY0In0=
```

##### Decipher
```bash
➜ encryptor --dec --key '5mimovgZ4oxbEoktPRKpVlu8LUL6JZRJb1+Y5JzJkIc=' \
 --value 'eyJpdiI6Ik1HWTFZbVkwWmpneE1EZGlZVEkyT1E9PSIsInZhbHVlIjoiTXNvZWQ3WXE2SlVuVkpkNTM5SHdiQT09IiwibWFjIjoiMTA5OTllYTQ3YjcwYTIxYWU1MmVkZDAyNzIwODg1ZGE0YWJhZWIwOWMyNjVmYmY1ZDI0NTJjMDRhYjE0ODg3YiJ9' \
 --serialize_mode json

[OPTIONS]
  [key] => 5mimovgZ4oxbEoktPRKpVlu8LUL6JZRJb1+Y5JzJkIc=
  [encrypted] => eyJpdiI6Ik1HWTFZbVkwWmpneE1EZGlZVEkyT1E9PSIsInZhbHVlIjoiTXNvZWQ3WXE2SlVuVkpkNTM5SHdiQT09IiwibWFjIjoiMTA5OTllYTQ3YjcwYTIxYWU1MmVkZDAyNzIwODg1ZGE0YWJhZWIwOWMyNjVmYmY1ZDI0NTJjMDRhYjE0ODg3YiJ9
  [serialize_mode] => json

[OUTPUT]
  [deciphered] => {"foo":1}
  [RAW deciphered] => j:{"foo":1}
```

###### without serialize_mode (default php)
```bash
➜ encryptor --dec --key '5mimovgZ4oxbEoktPRKpVlu8LUL6JZRJb1+Y5JzJkIc=' \
 --value 'eyJpdiI6Ik5EWmlaR0ZpTjJabFpEZGxOVFJrTmc9PSIsInZhbHVlIjoiYmo3RXJPMnNOamljamJITDMxZTVzcWxlUnpzN0RJdnZ4RUVpNTVvWlVKWT0iLCJtYWMiOiI2YjY4OGRiYjc0ZTg4NzlhMWYxMzI1MmZiOGY3Y2Q4YzM1MGEzMWUyZWE3ZWM3NjRmZTkyZTAwNGZkZGUyMmY0In0='

[OPTIONS]
  [key] => 5mimovgZ4oxbEoktPRKpVlu8LUL6JZRJb1+Y5JzJkIc=
  [encrypted] => eyJpdiI6Ik5EWmlaR0ZpTjJabFpEZGxOVFJrTmc9PSIsInZhbHVlIjoiYmo3RXJPMnNOamljamJITDMxZTVzcWxlUnpzN0RJdnZ4RUVpNTVvWlVKWT0iLCJtYWMiOiI2YjY4OGRiYjc0ZTg4NzlhMWYxMzI1MmZiOGY3Y2Q4YzM1MGEzMWUyZWE3ZWM3NjRmZTkyZTAwNGZkZGUyMmY0In0=
  [serialize_mode] => php

[OUTPUT]
  [deciphered] => {"foo":1}
  [RAW deciphered] => a:1:{s:3:"foo";i:1;}
```

## Tests

To be able to run `PHP test` you should install:

* PHP `>= 7.1.3`
* OpenSSL PHP Extension
* Mbstring PHP Extension
* Tokenizer PHP Extension
* Ctype PHP Extension
* JSON PHP Extension
* BCMath PHP Extension

```sh
$> npm run test
```

### Artillery test

In order to run Artillery integration test and stress test with aSync|Sync mode we have 

to [install artillery](https://artillery.io/docs/getting-started/) and artillery expect plugin.

```bash
$> npm install -g artillery artillery-plugin-expect
```
#### Run Artillery expect test

##### start server running in async mode
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

##### start server running in sync mode
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

### Run Artillery stress test

##### start server running in async mode
```bash
$> npm run artillery_server_async
```

##### start server running in sync mode
```bash
$> npm run artillery_server_sync
```

##### run test
```bash
$> npm run artillery
```

##### Async Mode
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

##### Sync Mode
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

#### Laravel Encrypter format:

Laravel only allows `AES-128-CBC` `AES-256-CBC`.
If no algorithm is defined default is `AES-256-CBC`

```json
{
  "iv":  "iv in base64",
  "value":  "encrypted data",
  "mac":  "Hash HMAC signature"
}
```
### Dependencies
* [php-serialize](https://github.com/steelbrain/php-serialize#readme)

### Contributing
Pull requests are welcome.

### License
[MIT](https://choosealicense.com/licenses/mit/)

