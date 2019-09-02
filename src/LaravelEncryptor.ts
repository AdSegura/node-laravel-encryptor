const Serialize = require('php-serialize');
const crypto = require('crypto');
const debug = require('debug')('LaravelEncryptor');

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
    constructor(private options: {laravel_key: string, key_length?: number }) {

        this.errors = [];

        debug(`constructor options: ${JSON.stringify(this.options)}\n`);

        this.setAlgorithm();

        debug('algorithm: ' + this.algorithm);

        this.secret = Buffer.from(this.options.laravel_key, 'base64');
    }

    /**
     * setAlgorithm
     *  will populate this.algorithm with valid one aes-[128]-cbc aes-[256]-cbc
     *  from options.key_length or this.key_length
     *
     *  if there is an error will push it to errors (and return as reject at public methods)
     */
    private setAlgorithm(){
        if(this.options.key_length && this.valid_key_lengths.indexOf(this.options.key_length) < 0)
            this.errors.push(new Error('The only supported ciphers are AES-128-CBC and AES-256-CBC with the correct key lengths.'));

        this.algorithm = this.options.key_length ?
            `aes-${this.options.key_length * 4}-cbc` : `aes-${this.key_length * 4}-cbc`;
    }

    /**
     * encrypt
     *
     * @param data
     * @param serialize
     */
    public encrypt(data: any, serialize?: boolean): Promise<string> {

        if(this.is_there_any_errors()) return Promise.reject(this.returnError());

        serialize = (serialize !== undefined) ? serialize : true;

        debug(`Encrypt, data to encrypt: ${data}, serialize: ${serialize}\n`);

        const payload = serialize ? this.serialize(data): data;

        return new Promise((resolve, reject) => {
            this.encryptIt(payload).then(encrypted => {
                encrypted.mac = this.hashIt(encrypted);

                encrypted = JSON.stringify(encrypted);
                encrypted = this.toBase64(encrypted);

                debug(`EncryptIt data encrypted: ${JSON.stringify(encrypted)}\n`);

                return resolve(encrypted)
            }).catch(e => {
                reject(e)
            })
        })
    }

    /**
     * decrypt
     *
     * @param data
     * @param serialize
     */
    public decrypt(data, serialize?: boolean): Promise<string> {

        if(this.is_there_any_errors()) return Promise.reject(this.returnError());

        return new Promise((resolve, reject) => {
            this.decryptIt(data, serialize).then(decrypted => {
                return resolve(decrypted)
            }).catch(e => {
                reject(e)
            })
        })
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

        debug(`decryptIt, data to decrypt: ${payload}, unserialize: ${serialize}\n`);

        return new Promise((resolve, reject) => {

            payload = this.base64ToUtf8(payload);

            try {
                payload = JSON.parse(payload);
            }catch (e) {
                return reject(e);
            }

            debug(`DecryptIt payload AFTER base64ToUtf8 and JSON.parse ${JSON.stringify(payload)}\n`);

            this.createDecipheriv(payload.iv).then(_ => {

                let decrypted = this.deCipher.update(payload.value, 'base64', 'utf8') + this.deCipher.final('utf8');

                decrypted = serialize ? this.unSerialize(decrypted) : decrypted;

                debug(`DecryptIt final payload: ${decrypted}`);

                resolve(decrypted)

            }).catch(e => {
                return reject(e);
            })
        });
    }

    /**
     * encryptIt
     *
     * @param data serialized
     * @return Promise object {iv, value}
     */
    private encryptIt(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.createCypher().then(iv => {

                let encrypted = this.cipher.update(data, 'utf8', 'base64') + this.cipher.final('base64');

                resolve({iv: this.toBase64(iv), value: encrypted})

            }).catch(e => {
                return reject(e);
            })
        });
    }

    /**
     * crypto createCipheriv
     *
     * @return Promise crypto cipher
     */
    private createCypher(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.generate_iv().then(iv => {
                try {
                    this.cipher = crypto.createCipheriv(this.algorithm, this.secret, iv);
                    resolve(iv)
                } catch (e) {
                    reject(e)
                }
            }).catch(e => {
                return reject(e)
            })
        })
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
                resolve(true)
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * Generate 16 bytes IV
     *
     * @return Promise hex string
     */
    private generate_iv(): Promise<string> {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buffer) => {
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
    private serialize(data): any {
        return Serialize.serialize(data)
    }

    /**
     * Unserialize data
     *
     * @param data
     * @return unserialized data
     */
    private unSerialize(data): any {
        return Serialize.unserialize(data)
    }

    /**
     * Convert data to base64
     *
     * @param data
     * @return base64 string
     */
    private toBase64(data): any {
        let buff = Buffer.from(data);
        return buff.toString('base64');
    }

    /**
     * Parse base64 to utf8
     *
     * @param data
     * @return utf8 string
     */
    private base64ToUtf8(data): any {
        let buff = Buffer.from(data, 'base64');
        return buff.toString('utf8');
    }


    /**
     * Create HMAC hash a la laravel
     *
     * @param payload {iv, encrypted}
     * @return hex string
     */
    private hashIt(payload): any {
        let hmac = crypto.createHmac("sha256", this.secret);
        return hmac.update(Buffer.from(payload.iv + payload.value, 'utf-8')).digest("hex");
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
    private returnError(){
        return this.errors[0];
    }
}
