const Serialize = require('php-serialize');
const crypto = require('crypto');

export class Base_encryptor {

    /** Cypher type */
    protected algorithm: string;

    /** Laravel's APP_KEY Buffer */
    protected readonly secret: any;

    /** key length */
    protected key_length: number = 64;

    /** valid key length in laravel aes-[128]-cbc aes-[256]-cbc */
    private readonly valid_key_lengths = [32, 64];

    /** Bytes number for crypto.randomBytes */
    protected readonly random_bytes = 8;

    /**
     * Return new Encryptor
     *
     * @param options {key: string, key_length?: number }
     */
    constructor(protected options: { laravel_key?: string, key?: string, key_length?: number }) {

        if (this.options.laravel_key)
            console.log('DeprecationWarning: Laravel Encryptor, laravel_key is depreciated, please use key instead');

        const key = this.options.laravel_key ? this.options.laravel_key: this.options.key;

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
    protected setAlgorithm() {
        if (this.options.key_length && this.valid_key_lengths.indexOf(this.options.key_length) < 0)
            throw new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.');

        this.algorithm = this.options.key_length ?
            `aes-${this.options.key_length * 4}-cbc` : `aes-${this.key_length * 4}-cbc`;
    }

    /**
     * ifSerialized_unserialize
     *
     * @param decrypted
     * @param serialize
     */
    protected ifSerialized_unserialize(decrypted, serialize) {
        return serialize ? Base_encryptor.unSerialize(decrypted) : decrypted;
    }

    /**
     * Create HMAC hash a la laravel
     *
     * @param iv
     * @param encrypted
     * @return hex string
     */
    protected hashIt(iv, encrypted): any {
        const hmac = Base_encryptor.createHmac("sha256", this.secret);
        return hmac
            .update(Base_encryptor.setHmacPayload(iv, encrypted))
            .digest("hex");
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
