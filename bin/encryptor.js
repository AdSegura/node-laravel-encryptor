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
        console.log(Encryptor.generateRandomKey());
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
        console.group('[OPTIONS]');
        console.log('[key] => ' + key);
        console.log('[value] => ' + valuePreJson);
        console.log('[serialize_mode] => ' +  cipher.options.serialize_mode);
        console.groupEnd();
        console.log();
        console.group('[OUTPUT]');
        console.log('[ciphered] => ' +  cipher.encryptSync(value));
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
        console.group('[OPTIONS]');
        console.log('[key] => ' + key);
        console.log('[encrypted] => ' + value);
        console.log('[serialize_mode] => ' +  cipher.options.serialize_mode);
        console.groupEnd();
        console.log();
        console.group('[OUTPUT]');
        console.log('[deciphered] => ' +  decrypted);
        console.log('[RAW deciphered] => ' +  cipher.getRawDecrypted());
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



