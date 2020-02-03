#!/usr/bin/env node

process.env.NODE_ENV = 'test';

const {Encryptor} = require('../dist');

const args = process.argv.splice(2);

const docs = [
    {command: 'encryptor', option: '--gen', description: 'generate key'},
    {command: 'encryptor', option: '--enc --key <key> --value <value> [--serialize_mode json|php]', description: 'cipher value'},
    {command: 'encryptor', option: '--dec --key <key> --value <value> [--serialize_mode json|php]', description: 'decipher value'}
];

const validArgs = (args) => {
    if(! args.includes('--key')) throw new Error('no --key defined');
    if(! args.includes('--value')) throw new Error('no --value to cipher/decipher');

    let key, value, serialize_mode;

    key = args[2];
    value = args[4];
    serialize_mode = args[6] || 'php';

    return {key, value, serialize_mode}

};

switch (args[0]) {

    case '--gen':{
        let cbc = 256;
        if(parseInt(args[1]) === 128) cbc = 128;
        console.log('\x1b[33m%s\x1b[0m', Encryptor.generateRandomKey(cbc));
        break;
    }

    case '--enc': {
        let {key, value, serialize_mode} = validArgs(args);

        const valuePreJson = value;

        try{
            value = JSON.parse(value);
        }catch (e) {

        }

        const cipher = new Encryptor({key, serialize_mode});

        console.log();
        console.group('\x1b[34m%s\x1b[0m','[OPTIONS]');
        console.log('\x1b[90m[key]\x1b[0m => \x1b[2m' + key + '\x1b[0m');
        console.log('\x1b[90m[value]\x1b[0m => \x1b[2m' + valuePreJson + '\x1b[0m');
        console.log('\x1b[90m[serialize_mode]\x1b[0m => \x1b[2m' +  cipher.options.serialize_mode + '\x1b[0m');
        console.groupEnd();
        console.log();
        console.group('\x1b[93m%s\x1b[0m', '[OUTPUT]');
        console.log('\x1b[2m[ciphered]\x1b[0m => ' +   '\x1b[33m' + cipher.encryptSync(value) + '\x1b[0m');
        console.groupEnd();
        console.log();

        break;
    }

    case '--dec': {
        let {key, value, serialize_mode} = validArgs(args);

        serialize_mode = serialize_mode || 'php';

        const cipher = new Encryptor({key, serialize_mode});
        let decrypted = cipher.decrypt(value);

        if(typeof decrypted === 'object'){
            decrypted = JSON.stringify(decrypted)
        }

        console.log();
        console.group('\x1b[34m%s\x1b[0m', '[OPTIONS]');
        console.log('\x1b[90m[key]\x1b[0m => \x1b[2m' + key + '\x1b[0m');
        console.log('\x1b[90m[encrypted]\x1b[0m => \x1b[2m' + value + '\x1b[0m');
        console.log('\x1b[90m[serialize_mode]\x1b[0m => \x1b[2m' +  cipher.options.serialize_mode + '\x1b[0m');
        console.groupEnd();
        console.log();
        console.group('\x1b[93m%s\x1b[0m', '[OUTPUT]');
        console.log('\x1b[2m[deciphered]\x1b[0m => ' +  '\x1b[33m'  +  decrypted + '\x1b[0m');
        console.log('\x1b[2m[RAW deciphered]\x1b[0m => ' +  '\x1b[33m'  + cipher.getRawDecrypted() + '\x1b[0m');
        console.groupEnd();
        console.log();

        break;
    }

    default:{
        console.group('Usage');
        docs.forEach(doc => {
            console.log(doc.command, doc.option)
        });
    }
}



