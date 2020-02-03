<?php
include 'tests/php/Encrypter.php';

$key = $argv[1];
$mode = $argv[2];
$encrypted = $argv[3];

$enc = new Encrypter(base64_decode($key), $mode);

$de = $enc->decrypt($encrypted, $unserialize = true);

echo json_encode($de);
