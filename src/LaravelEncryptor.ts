import {Base_encryptor} from "./base_encryptor";
const crypto = require('crypto');

// Cipher steps:
// serialize
// cipher
// base64 iv
// hash HMac: iv + encrypted
// json_encode {iv, encrypted, MAC}
// base64

/**
 * Class to Encrypt/Decrypt data compatible
 *  with Laravel 5.8 Illuminate/Encryption/Encrypter.php (and maybe lower versions)
 *
 *  Only [aes-128-cbc] and [aes-256-cbc] algorithms are available
 *
 * Use:
 *      foo = new Encryptor({key})
 *
 *      foo.encrypt('ferrets better than cats')
 *          return Promise [base64 string] of a serialized object {iv, encrypted, mac}
 *
 *      foo.decrypt(payload)
 *          payload: [base64 string] of a serialized or unserialized object {iv, encrypted, mac}
 *          return Promise decrypted value of payload.value
 */
export class LaravelEncryptor extends Base_encryptor {

    /**
     * Return new Async Encryptor
     *
     * @param options {key: string, key_length?: number }
     */
    constructor(options) {
        super(options);
    }

    /**
     * encrypt
     *
     * @param data string, Buffer, TypedArray, or DataView
     *
     * @param serialize
     */
    public encrypt(data: any, serialize?: boolean): Promise<any> {

        const payload  = LaravelEncryptor.prepareData(data, serialize);

        return this
            .encryptIt(payload)
            .then(LaravelEncryptor.stringifyAndBase64, LaravelEncryptor.throwError)
    }

    /**
     * encryptIt
     *
     * @param data serialized
     * @return Promise object {iv, value, mac}
     */
    private encryptIt(data): Promise<any> {
        return this
            .generate_iv()
            .then(this.createCypherIv())
            .then(this.cipherIt(data))
            .then(this.generateEncryptedObject())
    }

    /**
     * crypto createCipheriv
     *
     * @return Promise crypto cipher
     */
    private createCypherIv(): any {
        return (iv) => {
            try {
                 return {iv, cipher: crypto.createCipheriv(this.algorithm, this.secret, iv)};
            } catch (e) {
                throw e
            }
        }
    }

    /**
     * generate Laravel Encrypted Object
     *
     * @param data
     */
    private cipherIt(data) {
        return ({iv, cipher}: any) => {
            return {
                iv,
                value: cipher.update(data, 'utf8', 'base64') + cipher.final('base64')
            };
        }
    }

    /**
     * generate Laravel Encrypted Object
     */
    private generateEncryptedObject() {
        return ({iv, value}: any) => {
            iv = LaravelEncryptor.toBase64(iv);
            return {
                iv,
                value,
                mac: this.hashIt(iv, value)
            };
        }
    }

    /**
     * decrypt
     *
     * @param data
     * @param serialize
     */
    public decrypt(data, serialize?: boolean): Promise<string> {
        return this.decryptIt(data, serialize)
    }

    /**
     * decryptIt
     *
     * @param payload string
     * @param serialize
     * @return decrypted string
     */
    private decryptIt(payload, serialize?: boolean): Promise<any> {

        serialize = (serialize !== undefined) ? serialize : true;

        payload = LaravelEncryptor.base64ToUtf8(payload);

        try {
            payload = JSON.parse(payload);
        } catch (e) {
            return Promise.reject(e);
        }

        return this
            .createDecipheriv(payload.iv)
            .then(this.cryptoDecipher(payload))
            .then(this.ifSerialized_unserialize(serialize), LaravelEncryptor.throwError)
    }

    /**
     * crypto createDecipheriv
     *
     * @param iv
     * @return Promise crypto decipher
     */
    private createDecipheriv(iv): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const deCipher = crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(iv, 'base64'));
                resolve(deCipher)
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * cryptoDecipher
     *
     * @param payload
     */
    private cryptoDecipher(payload) {
        return (deCipher) => {
            return deCipher.update(payload.value, 'base64', 'utf8') + deCipher.final('utf8');
        }
    }

    /**
     * ifSerialized_unserialize
     *
     * @param serialize
     */
    protected ifSerialized_unserialize(serialize){
        return (decrypted) => {
            return serialize ? LaravelEncryptor.unSerialize(decrypted) : decrypted;
        }
    }

    /**
     * Generate 8 bytes IV
     *
     * @return Promise [16 hexadecimal string]
     */
    private generate_iv(): Promise<string> {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(this.random_bytes, (err, buffer) => {
                if (err) return reject(err);
                resolve(buffer.toString('hex'))
            });
        });
    }

    /**
     * Throw Error.
     *
     * @param error
     */
    static throwError(error) {
        throw error;
    }
}
