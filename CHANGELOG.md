# v3.0.2
* npm packages update
# v3.0.1
* [Bug](https://github.com/AdSegura/node-laravel-encryptor/issues/1) discovered by [LaserGoat](https://github.com/lasergoat) 
* options.key_length now equal to 128/256 that means aes-128-cbc aes-256-cbc...
* GenerateRandomKey function updated.
* tests 
# v2.0.5 
* mocha tests no TS  

# v2.0.4 
* Encryptor npm binary  

# v2.0.3 
* `JsonSerializer.serialize` now stringify an object 
a la ExpressJS cookie json serializer style, 
adding string `j:` to stringify object.
* `JsonSerializer.unserialize` now checks before parsing if string 
starts with `j:`   

# v2.0.2 
* Custom Serializer can be injected into Encryptor
* fixes with custom errors
* tests
 
# v2.0.1 
* Serializer can be php-serializer or JSON native nodejs 
* force_serialize option added when Serializer is php-serialize
* tests
