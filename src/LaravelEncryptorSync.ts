import {Base_encryptor} from "./base_encryptor";
const crypto = require('crypto');

/**
 * Class to Encrypt/Decrypt Sync Mode data compatible
 *  with Laravel 5.8 Illuminate/Encryption/Encrypter.php (and maybe lower versions)
 *
 *  Only [aes-128-cbc] and [aes-256-cbc] algorithms are available
 *
 * Use:
 *      foo = new EncryptorSync({key})
 *
 *      foo.encrypt('ferrets better than cats')
 *          return [base64 string] of a serialized object {iv, encrypted, mac}
 *
 *      foo.decrypt(payload)
 *          payload: [base64 string] of a serialized or unserialized object {iv, encrypted, mac}
 *          return decrypted value of payload.value
 */
export class LaravelEncryptorSync extends Base_encryptor {

    /**
     * Return new EncryptorSync
     *
     * @param options { key: string, key_length?: number }
     */
    constructor(options) {
        super(options)
    }

    /**
     * encrypt
     *
     * @param data string, Buffer, TypedArray, or DataView
     *
     * @param serialize
     */
    public encrypt(data: any, serialize?: boolean): string {

        const payload  = LaravelEncryptorSync.prepareData(data, serialize);

        return LaravelEncryptorSync.stringifyAndBase64(this.encryptIt(payload))
    }

    /**
     * encryptIt
     *
     * @param data
     * @return object {iv, value, mac}
     */
    private encryptIt(data): any {
        const buf = crypto.randomBytes(this.random_bytes);

        const iv = buf.toString('hex');

        const cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);

        const value = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');

        return this.generateEncryptedObject({iv, value})
    }

    /**
     * generate Laravel Encrypted Object
     */
    private generateEncryptedObject({iv, value}: any) {
        iv = LaravelEncryptorSync.toBase64(iv);
        return {
            iv,
            value,
            mac: this.hashIt(iv, value)
        };
    }

    /**
     * decrypt
     *
     * @param data
     * @param serialize
     */
    public decrypt(data, serialize?: boolean): string {
        return this.decryptIt(data, serialize)
    }

    /**
     * decryptIt
     *
     * @param payload string
     * @param serialize
     * @return decrypted string
     */
    private decryptIt(payload, serialize?: boolean): string {

        serialize = (serialize !== undefined) ? serialize : true;

        payload = LaravelEncryptorSync.base64ToUtf8(payload);

        try {
            payload = JSON.parse(payload);
        } catch (e) {
            throw e;
        }

        const deCipher = crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(payload.iv, 'base64'));

        const deciphered = deCipher.update(payload.value, 'base64', 'utf8') + deCipher.final('utf8');

        return this.ifSerialized_unserialize(deciphered, serialize);
    }

}
