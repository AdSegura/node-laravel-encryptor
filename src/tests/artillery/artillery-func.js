const {Encryptor} = require('../../../dist');
const cipher = new Encryptor({key: 'c0gDOf2wqPLyJ8eZsmEcf8XPRyu24cSPcEZfGs12v78='});
const assert = require('assert');

const encryptor = (requestParams, response, context, ee, next) => {
    const payload = JSON.parse(response.body);
    const dec = cipher.decrypt(payload.encrypted);
    assert.ok(dec == payload.id);
    return next();
};

module.exports = {
    encryptor
};
