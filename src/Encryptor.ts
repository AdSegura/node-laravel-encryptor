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
export class Encryptor extends Base_encryptor {

    /**
     * Return new Encryptor
     *
     * @param options {key: string, key_length?: number, random_bytes?: number = 8 }
     */
    constructor(options) {
        super(options);
    }

    /**
     * encrypt
     *
     * @param data string, Buffer, TypedArray, or DataView
     */
    public encrypt(data: any): Promise<any> {

        const payload  = Encryptor.prepareData(data);

        return this
            .encryptIt(payload)
            .then(Encryptor.stringifyAndBase64, Encryptor.throwError)
    }

    /**
     * encrypt Sync mode
     *
     * @param data string, Buffer, TypedArray, or DataView
     *
     */
    public encryptSync(data: any): string {

        const payload  = Encryptor.prepareData(data);

        return Encryptor.stringifyAndBase64(this.encryptItSync(payload))
    }


    /**
     * encryptIt
     *
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
                Encryptor.throwError(e.message);
            }
        }
    }

    /**
     * generate a la Laravel Encrypted Object
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
     * decrypt
     *
     * @param data
     */
    public decrypt(data): any {
        return this.decryptIt(data)
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
     * static_decipher
     *  helper method
     *
     * @param key
     * @param data
     */
    static static_decipher(key, data){
        const encrypt = new Encryptor({key});
        return encrypt.decryptIt(data)
    }

    /**
     * static_cipher
     *  helper method, run in sync mode
     * @param key
     * @param data
     * @param cb
     */
    static static_cipher(key, data, cb?){
        const encrypt = new Encryptor({key});

        if(typeof cb === 'function')
            encrypt.encrypt(data)
                .then(enc => cb(null, enc))
                .catch(e => cb(e));
        else
            return encrypt.encryptSync(data)
    }
}
