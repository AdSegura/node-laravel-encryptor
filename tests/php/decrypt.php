<?php
include 'tests/php/Encrypter.php';

//$encrypted = 'eyJpdiI6Ik1qQTRZbVk0WkRZMU9ERmtZbU5qTkE9PSIsInZhbHVlIjoiejByWHNEMEM1VkpoNlNjQ21lMTFjRkNkYnVLd1VteVB4bnppaUdOMTNBMD0iLCJtYWMiOiI3NzZkZjAxZjIzZDQ0YTE5YmY5MDM1ZGFmZjMxNzU4MmEwZDZiODZjNmQxOGM3NTE2ODMyZGI5MjMzZGZhNTg4In0=';

$encrypted = $argv[1];

$enc = new Encrypter(base64_decode('LQUcxdgHIEiBAixaJ8BInmXRHdKLOacDXMEBLU0Ci/o='), 'AES-256-CBC');
$de = $enc->decrypt($encrypted, $unserialize = true);

echo $de;
