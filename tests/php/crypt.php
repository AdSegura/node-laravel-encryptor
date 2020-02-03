<?php
include 'tests/php/Encrypter.php';

$payload = ['foo' => 'bar'];
$key = $argv[1];
$mode = $argv[2];

$enc = new Encrypter(base64_decode($key), $mode);

$encrypted = $enc->encrypt($payload, $serialize = true);

echo $encrypted;

