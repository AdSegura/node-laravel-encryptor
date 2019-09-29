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
