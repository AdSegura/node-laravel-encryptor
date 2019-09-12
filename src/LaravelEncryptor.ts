const Serialize = require('php-serialize');
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
 *      foo = new LaravelEncryptor({laravel_key})
 *
 *      foo.encrypt('ferrets better than cats')
 *          return Promise [base64 string] of a serialized object {iv, encrypted, mac}
 *
 *      foo.decrypt(payload)
 *          payload: [base64 string] of a serialized or unserialized object {iv, encrypted, mac}
 *          return Promise decrypted value of payload.value
 */
export class LaravelEncryptor {

    /** Cypher type */
    private algorithm: string;

    /** Laravel's APP_KEY Buffer */
    private readonly secret: any;

    /** key length */
    private key_length: number = 64;

    /** valid key length in laravel aes-[128]-cbc aes-[256]-cbc */
    private readonly valid_key_lengths = [32, 64];

    /** cipher: node crypto instance */
    private cipher: any;

    /** decipher: node crypto instance */
    private deCipher: any;

    /** array errors */
    private errors: any;

    /**
     * Return new Laravel Encryptor
     *
     * @param options {laravel_key: string, key_length?: number }
     */
    constructor(private options: { laravel_key: string, key_length?: number }) {

        this.errors = [];

        this.setAlgorithm();

        this.secret = Buffer.from(this.options.laravel_key, 'base64');
    }

    /**
     * setAlgorithm
     *  will populate this.algorithm with valid one aes-[128]-cbc aes-[256]-cbc
     *  from options.key_length or this.key_length
     *
     *  if there is an error will push it to errors (and return as reject at public methods)
     */
    private setAlgorithm() {
        if (this.options.key_length && this.valid_key_lengths.indexOf(this.options.key_length) < 0)
            this.errors.push(new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.'));

        this.algorithm = this.options.key_length ?
            `aes-${this.options.key_length * 4}-cbc` : `aes-${this.key_length * 4}-cbc`;
    }

    /**
     * encrypt
     *
     * @param data string, Buffer, TypedArray, or DataView
     *
     * @param serialize
     */
    public encrypt(data: any, serialize?: boolean): Promise<any> {

        if (this.is_there_any_errors()) return Promise.reject(this.returnError());

        serialize = (serialize !== undefined) ? serialize : true;

        const payload = serialize ? LaravelEncryptor.serialize(data) : data;

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
            .then(this.createCypher())
            .then(this.generateEncryptedObject(data))
    }

    /**
     * crypto createCipheriv
     *
     * @return Promise crypto cipher
     */
    private createCypher(): any {
        return (iv) => {

            try {
                this.cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);
                return iv;
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
    private generateEncryptedObject(data) {
        return (iv) => {

            const encrypted = this.cipher.update(data, 'utf8', 'base64') + this.cipher.final('base64');

            iv = LaravelEncryptor.toBase64(iv);

            return {
                iv,
                value: encrypted,
                mac: this.hashIt(iv, encrypted)
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

        if (this.is_there_any_errors()) return Promise.reject(this.returnError());

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
                this.deCipher = crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(iv, 'base64'));
                resolve()
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
        return () => {
            return this.deCipher.update(payload.value, 'base64', 'utf8') + this.deCipher.final('utf8');
        }
    }

    /**
     * ifSerialized_unserialize
     *
     * @param serialize
     */
    private ifSerialized_unserialize(serialize){
        return (decrypted) => {
            return serialize ? LaravelEncryptor.unSerialize(decrypted) : decrypted;
        }
    }

    /**
     * Generate 16 bytes IV
     *
     * @return Promise hex string
     */
    private generate_iv(): Promise<string> {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buffer) => {
                if (err) return reject(err);
                resolve(buffer.toString('hex').slice(0, 16))
            });
        });
    }

    /**
     * serialize data
     *
     * @param data
     * @return serialized data
     */
    static serialize(data): any {
        return Serialize.serialize(data)
    }

    /**
     * Unserialize data
     *
     * @param data
     * @return unserialized data
     */
    static unSerialize(data): any {
        return Serialize.unserialize(data)
    }

    /**
     * Convert data to base64
     *
     * @param data
     * @return base64 string
     */
    static toBase64(data): any {
        return Buffer.from(data).toString('base64');
    }

    /**
     * Parse base64 to utf8
     *
     * @param data
     * @return utf8 string
     */
    static base64ToUtf8(data): any {
        return Buffer.from(data, 'base64').toString('utf8');
    }


    /**
     * Create HMAC hash a la laravel
     *
     * @param iv
     * @param encrypted
     * @return hex string
     */
    private hashIt(iv, encrypted): any {
        const hmac = LaravelEncryptor.createHmac("sha256", this.secret);
        return hmac
            .update(LaravelEncryptor.setHmacPayload(iv, encrypted))
            .digest("hex");
    }

    /**
     * Create crypto Hmac
     *
     * @param alg
     * @param secret
     */
    static createHmac(alg, secret) {
        return crypto.createHmac(alg, secret);
    }

    /**
     * Set hmac payload
     *
     * @param iv
     * @param encrypted
     */
    static setHmacPayload(iv, encrypted) {
        return Buffer.from(iv + encrypted, 'utf-8')
    }

    /**
     * is_there_any_errors
     */
    private is_there_any_errors(): boolean {

        return this.errors.length >= 1;
    }

    /**
     * returnError
     *
     * will return first error in this.errors
     *  if there is an error will push it to errors (and return as reject at public methods)
     */
    private returnError() {
        return this.errors[0];
    }

    /**
     * stringifyAndBase64
     *  will json.stringify object {iv, value, mac} and base64 it
     *
     * @param encrypted {iv, value, mac}
     * @return string base64
     */
    static stringifyAndBase64(encrypted) {
        encrypted = JSON.stringify(encrypted);
        return Buffer.from(encrypted).toString('base64');
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
