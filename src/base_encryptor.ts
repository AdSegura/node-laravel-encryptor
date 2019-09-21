const Serialize = require('php-serialize');
const crypto = require('crypto');

export class Base_encryptor {

    /** Cypher type */
    protected algorithm: string;

    /** SECRET KEY Buffer */
    protected readonly secret: any;

    /** key length */
    protected key_length: number = 64;

    /** valid key length in laravel aes-[128]-cbc aes-[256]-cbc */
    private readonly valid_key_lengths = [32, 64];

    /** Bytes number for crypto.randomBytes default 8 */
    protected random_bytes;

    /**
     * Return new Encryptor
     *
     * @param options {key: string, key_length?: number }
     */
    constructor(protected options: { laravel_key?: string, key?: string, key_length?: number , random_bytes?: number }) {

        if (this.options.laravel_key)
            console.log('DeprecationWarning: Laravel Encryptor, laravel_key is depreciated, please use key instead');

        const key = this.options.laravel_key ? this.options.laravel_key: this.options.key;

        this.setAlgorithm();

        this.secret = Buffer.from(key, 'base64');

        this.random_bytes = this.options.random_bytes ? this.options.random_bytes : 8;
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
     * decryptIt
     *
     * @param payload
     */
    protected decryptIt(payload){

        payload = Base_encryptor.base64ToUtf8(payload);

        try {
            payload = JSON.parse(payload);
        } catch (e) {
            throw new Error('Encryptor decryptIt cannot parse json')
        }

        //TODO check hmac payload.mac with crypto.timingSafeEqual to prevent timing attacks
        if(! Base_encryptor.validPayload(payload))
            throw new Error('The payload is invalid.');

        if(! this.validMac(payload))
            throw new Error('The MAC is invalid.');

        const decipherIv = this.createDecipheriv(payload.iv);
        const decrypted = Base_encryptor.cryptoDecipher(payload, decipherIv);
        return Base_encryptor.ifSerialized_unserialize(decrypted)
    }

    /**
     * validPayload
     *
     * @param payload
     */
    static validPayload(payload){
        return payload.hasOwnProperty('iv') && payload.hasOwnProperty('value') && payload.hasOwnProperty('mac')
                && Buffer.from(payload.iv,'base64').toString('hex').length === 32;
    }

    /**
     * validMac
     *
     * @param payload
     */
     validMac(payload){
         try {
             const calculated = this.hashIt(payload.iv, payload.value);
             return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(payload.mac))
         }catch (e) {
             return false;
         }
     }

    /**
     * encryptIt
     *
     * @param data
     * @return object {iv, value, mac}
     */
    protected encryptItSync(data): any {
        const buf = crypto.randomBytes(this.random_bytes);

        const iv = buf.toString('hex');

        const cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);

        const value = cipher.update(data, 'utf8', 'base64') + cipher.final('base64');

        return this.generateEncryptedObject()({iv, value})
    }

    /**
     * generate Laravel Encrypted Object
     */
    protected generateEncryptedObject() {
        return ({iv, value}: any) => {
            iv = Base_encryptor.toBase64(iv);
            return {
                iv,
                value,
                mac: this.hashIt(iv, value)
            };
        }
    }

    /**
     * crypto createDecipheriv
     *
     * @param iv
     * @return crypto decipher
     */
    protected createDecipheriv(iv) {
        return crypto.createDecipheriv(this.algorithm, this.secret, Buffer.from(iv, 'base64'));
    }

    /**
     * cryptoDecipher
     *
     * @param payload
     * @param decipher
     */
    static cryptoDecipher(payload, decipher) {
        return decipher.update(payload.value, 'base64', 'utf8') + decipher.final('utf8');
    }

    /**
     * Prepare Data
     *  will receive data from this.encrypt(data)
     *  and check if is a number to convert to string,
     *  return data serialized if need it
     *
     * @param data
     */
    static prepareData(data){

        if(! data) throw new Error('You are calling Encryptor without data to cipher');

        data = Base_encryptor.ifNumberToString(data);

        return Base_encryptor.ifObjectToString(data);
    }

    /**
     * ifSerialized_unserialize
     *
     * @param decrypted
     */
    static ifSerialized_unserialize(decrypted) {
        return Base_encryptor.isSerialized(decrypted) ? Base_encryptor.unSerialize(decrypted) : decrypted;
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
     * is serialize data
     *
     * @param data
     * @return serialized data
     */
    static isSerialized(data): any {
        return Serialize.isSerialized(data)
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
     * ifObjectToString serialize object
     *
     * @param data
     */
    static ifObjectToString(data){
        return (typeof data === 'object') ?  Base_encryptor.serialize(data) : data;
    }

    /**
     * number To String
     *  if data is a number convert to string
     *
     * @param data
     */
    static ifNumberToString(data){
        return (typeof data === 'number') ?  data + '' : data;
    }

    /**
     * Generate a random key for the application.
     *
     * @return string
     */
    static generateRandomKey(length?: number): string {
        length = length ? length : 32;
        const buf = crypto.randomBytes(length);
        return buf.toString('base64');
    }
}
