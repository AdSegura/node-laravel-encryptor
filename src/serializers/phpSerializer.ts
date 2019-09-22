import {Serialize_Interface} from "../contracts/Serialize_Interface";
import {EncryptorError} from "../lib/EncryptorError";
const Serialize = require('php-serialize');

export class PhpSerializer implements Serialize_Interface{

    /**
     * Serialize
     *
     * @param data
     */
    serialize(data: any): string {
        return Serialize.serialize(data)
    }

    /**
     * Unserialize
     *  if not serialized return data untouched
     *
     * @param data
     */
    unSerialize(data: any): any {
        if (!Serialize.isSerialized(data)) return data;
        try {
            return Serialize.unserialize(data)
        } catch (e) {
            throw new EncryptorError('phpUnSerialize Error unserialize data')
        }
    }

}
