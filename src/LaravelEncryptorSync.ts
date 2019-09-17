const Serialize = require('php-serialize');
const crypto = require('crypto');

/**
 * Class to Encrypt/Decrypt Sync Mode data compatible
 *  with Laravel 5.8 Illuminate/Encryption/Encrypter.php (and maybe lower versions)
 *
 *  Only [aes-128-cbc] and [aes-256-cbc] algorithms are available
 *
 * Use:
 *      foo = new LaravelEncryptorSync({key})
 *
 *      foo.encrypt('ferrets better than cats')
 *          return [base64 string] of a serialized object {iv, encrypted, mac}
 *
 *      foo.decrypt(payload)
 *          payload: [base64 string] of a serialized or unserialized object {iv, encrypted, mac}
 *          return decrypted value of payload.value
 */
export class LaravelEncryptorSync {

    /** Cypher type */
    private algorithm: string;

    /** Laravel's APP_KEY Buffer */
    private readonly secret: any;

    /** key length */
    private key_length: number = 64;

    /** valid key length in laravel aes-[128]-cbc aes-[256]-cbc */
    private readonly valid_key_lengths = [32, 64];


    /**
     * Return new Laravel Encryptor
     *
     * @param options {laravel_key: string, key_length?: number }
     */
    constructor(private options: { laravel_key?: string, key?: string, key_length?: number }) {

        if (this.options.laravel_key)
            console.log('Laravel Encryptor, laravel_key is depreciated, please use key instead');

        const key = this.options.laravel_key ? this.options.laravel_key : this.options.key;

        this.setAlgorithm();

        this.secret = Buffer.from(key, 'base64');
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
            throw new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');

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
    public encrypt(data: any, serialize?: boolean): string {

        serialize = (serialize !== undefined) ? serialize : true;

        const payload = serialize ? LaravelEncryptorSync.serialize(data) : data;

        return LaravelEncryptorSync.stringifyAndBase64(this.encryptIt(payload))
    }

    /**
     * encryptIt
     *
     * @param data serialized
     * @return object {iv, value, mac}
     */
    private encryptIt(data): any {
        const buf = crypto.randomBytes(8);
        let iv = buf.toString('hex');
        let cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);
        let value = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
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

        payload = LaravelEncryptorSync.base64ToUtf8(payload);

        try {
            payload = JSON.parse(payload);
        } catch (e) {
            throw e;
        }

        const deCipher = crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(payload.iv, 'base64'));
        let deciphered = deCipher.update(payload.value, 'base64', 'utf8') + deCipher.final('utf8');
        return this.ifSerialized_unserialize(deciphered, serialize);
    }

    /**
     * ifSerialized_unserialize
     *
     * @param decrypted
     * @param serialize
     */
    private ifSerialized_unserialize(decrypted, serialize) {
        return serialize ? LaravelEncryptorSync.unSerialize(decrypted) : decrypted;
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
        const hmac = LaravelEncryptorSync.createHmac("sha256", this.secret);
        return hmac
            .update(LaravelEncryptorSync.setHmacPayload(iv, encrypted))
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
     * Generate a random key for the application.
     *
     * @return string
     */
    static generateRandomKey(length?: number) {
        return new Promise((resolve, reject) => {
            length = length ? length : 32;
            crypto.randomBytes(length, (err, buffer) => {
                if (err) return reject(err);
                resolve(buffer.toString('base64'))
            });
        })
    }
}
