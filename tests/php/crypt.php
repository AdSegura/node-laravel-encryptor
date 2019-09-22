<?php
include 'tests/php/Encrypter.php';

$payload = ['foo' => 'bar'];

$enc = new Encrypter(base64_decode('LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o='), 'AES-256-CBC');

$encrypted = $enc->encrypt($payload, $serialize = true);

echo $encrypted;

