const {EncryptorSync} = require('../../dist');
const encryptorSync = new EncryptorSync({key: 'c0gDOf2wqPLyJ8eZsmEcf8XPRyu24cSPcEZfGs12v78='});
const assert = require('assert');

const encryptor = (requestParams, response, context, ee, next) => {
    const payload = JSON.parse(response.body);
    const dec = encryptorSync.decrypt(payload.encrypted, false);
    assert.ok(dec === payload.id);
    return next();
};

module.exports = {
    encryptor
};
