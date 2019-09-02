<?php
include 'tests/php/Encrypter.php';

$enc = new Encrypter(base64_decode('LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o='), 'AES-256-CBC');

$encrypted = $enc->encrypt('resistance is futile', $unserialize = true);

echo $encrypted;

