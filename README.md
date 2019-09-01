# node-laravel-encryptor

NodeJS version Laravel's 5.8 (and probably older versions) of Encrypter 
Class
[Illuminate/Encryption/Encrypter.php](https://github.com/laravel/framework/blob/ad18538cd39a139d7aeee16c13062c8a4347141d/src/Illuminate/Encryption/Encrypter.php)


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
