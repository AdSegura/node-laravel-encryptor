import {EncryptorError} from "./EncryptorError";

const serialize = require('php-serialize');

export class Serialize {

    public serialize;
    public unSerialize;

    constructor(protected options) {

        if(! this.options.serialize_mode)
            this.options.serialize_mode ='json';

        switch (this.options.serialize_mode) {
            case 'json': {
                this.serialize = Serialize.jsonSerialize;
                this.unSerialize = Serialize.jsonUnSerialize;
                break;
            }
            case 'php': {
                this.serialize = Serialize.phpSerialize;
                this.unSerialize = Serialize.phpUnSerialize;
                break;
            }

            default: {
                throw new EncryptorError(
                    `Serialize Encryptor Class unknown option ${this.options.serialize_mode} serialize_mode`
                )
            }
        }
    }

    static jsonSerialize(data) {
        return JSON.stringify(data)
    }

    static jsonUnSerialize(data) {
        try {
            return JSON.parse(data)
        } catch (e) {
            return data;
        }
    }

    static phpSerialize(data) {
        return serialize.serialize(data)
    }

    static phpUnSerialize(data) {
        if (!serialize.isSerialized(data)) return data;

        try {
            return serialize.unserialize(data)
        } catch (e) {
            throw new EncryptorError('phpUnSerialize Error unserialize data')
        }
    }
}
