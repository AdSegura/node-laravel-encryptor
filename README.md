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
## Options 
###### Object  {key, key_length} 
* key: APP_KEY without `base64:` 
* laravel_key: `DEPRECIATED`
* key_length: optional 32|64 for aes-[128]-cbc aes-[256]-cbc

if no `key_length` is given default is 64.

## Methods

### encrypt
arguments:
* data: string|object|number

### decrypt
arguments:
* data: string|object|number

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

    node Laravel Encrypter
      ✓ should cipher and decipher
      ✓ should fail cipher and decipher object without serialize
      ✓ should cipher and decipher with no key_length defined
      ✓ should cipher and decipher with no serialize nor unserialize
      ✓ should fail cipher not valid Laravel Key
      ✓ should fail cipher not valid algorithm
      ✓ should fail decipher not valid data
      ✓ should cipher and decipher multiple times
      ✓ should decipher data at Laravel correctly (52ms)
      ✓ should decipher from Laravel correctly (50ms)
      ✓ should cipher and decipher Sync Mode
      ✓ should decipher data, Sync Mode, at Laravel correctly (45ms)
  
  
    12 passing (173ms)
    
    Express Crypto Cookie Compatible with Laravel
      ✓ should create one request to Express aSync Mode, receive cookie and decipher (38ms)
      ✓ should create one request to Express Sync Mode, receive cookie and decipher
  
    2 passing (61ms)

```

## Artillery test

In order to run Artillery integration test and stress test with aSync|Sync mode we have 

to [install artillery](https://artillery.io/docs/getting-started/) and artillery expect plugin.

```bash
$> npm install -g artillery artillery-plugin-expect
```

### Run Artillery test

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
Summary report @ 23:42:25(+0200) 2019-09-18
  Scenarios launched:  2000
  Scenarios completed: 2000
  Requests completed:  11009
  RPS sent: 109.59
  Request latency:
    min: 0.6
    max: 33.4
    median: 1
    p95: 1.8
    p99: 3.1
  Scenario counts:
    Integration Test, parallel request no loop: 999 (49.95%)
    Integration Test, parallel request: 1001 (50.05%)
  Codes:
    200: 11009
```

#### Sync Mode
```sh
Summary report @ 23:55:08(+0200) 2019-09-18
  Scenarios launched:  2000
  Scenarios completed: 2000
  Requests completed:  11144
  RPS sent: 110.94
  Request latency:
    min: 0.6
    max: 28.3
    median: 1
    p95: 1.8
    p99: 3.1
  Scenario counts:
    Integration Test, parallel request no loop: 984 (49.2%)
    Integration Test, parallel request: 1016 (50.8%)
  Codes:
    200: 11144
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


## But with Sync mode Artillery wins 

When we cipher some data we use `crypto.randomBytes` function to generate cryptographically secure random bytes.

There are two modes with `crypto.randomBytes` synchronous or asynchronous, official docs says you should 
not use `crypto.randomBytes` synchronous mode on a production server.

This module gives you the two options and other modules (with thousands downloads) I saw are using `crypto.randomBytes` in synchronous mode.

### why chose Sync mode ?
If you want to write an encrypted cookie from a middleware you will prefer aSync mode,
 but inside a route function you will want to write a cookie as simple as this `res.ciperCookie(data)` 
 and not execute a Promise and wait.
 
 #### usual code to cipher a cookie, Sync mode
 ```js
 get('/very-complicated', (req, res) => {
     res.ciperCookieSync(data);
     
     doSomething()
        .then(doOtherThing)
        .then(doMuchMoreThings)
        .then(data => res.json(data))
        .catch(e => next(e))
 })
```

#### aSync mode code to cipher a cookie,
```js
 get('/very-complicated', (req, res) => {
     res.ciperCookiesaAsync(data)
        .then(doSomething)
        .then(doMuchMoreThings)
        .then(data => res.json(data))
        .catch(e => next(e))
 })
```

We can get rid of this Promises in route functions (expressJs) making a last middleware that should do the job
of writing custom data into a cookie or anywhere in aSync Mode, here a quick and dirt idea:

 ```js
 get('/very-complicated', (req, res, next) => {
     res.cipherCookie = data; //we store cookie data inside res object
     
     doSomething()
        .then(doOtherThing)
        .then(doMuchMoreThings)
        .then(data => {
            res.container = { data } //we pass data to next function
            next(); //call next function, our middleware 
        })
        .catch(e => next(e))
 })
```
 
 #### Last middleware:
  ```js
  (req, res, next) => {
      
    if(res.cipherCookie){
        return  res.ciperCookiesaAsync(res.cipherCookie)
                  .then(() => res.json(res.container))
                  .catch(e => next(e))
     }
      
     next();
  };
 ```
