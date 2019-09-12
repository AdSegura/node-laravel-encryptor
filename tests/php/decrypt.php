<?php
include 'tests/php/Encrypter.php';

$encrypted = $argv[1];

$enc = new Encrypter(base64_decode('LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o='), 'AES-256-CBC');

$de = $enc->decrypt($encrypted, $unserialize = true);

echo $de;
