import {EncryptorError} from "./EncryptorError";
import {Serialize_Interface} from "../contracts/Serialize_Interface";
import {JsonSerializer} from "../serializers/jsonSerializer";
import {PhpSerializer} from "../serializers/phpSerializer";

export class Serializer implements Serialize_Interface{

    /** Driver */
    private driver: Serialize_Interface;

    constructor(protected options) {

        //make default option to php-serialize
        if(! this.options.serialize_mode)
            this.options.serialize_mode ='php';

        switch (this.options.serialize_mode) {
            case 'json': {
                this.driver = new JsonSerializer;
                break;
            }
            case 'php': {
                this.driver = new PhpSerializer;
                break;
            }

            default: {
                throw new EncryptorError(
                    `Serializer Encryptor Class unknown option ${this.options.serialize_mode} serialize_mode`
                )
            }
        }
    }

    /**
     * Serialize
     *
     * @param data
     */
    serialize(data: any): string {
        if(! data) return;

        return this.driver.serialize(data);
    }

    /**
     * unSerialize
     *
     * @param data
     */
    unSerialize(data: string): any {
        if(! data) return;

        return this.driver.unSerialize(data);
    }
}
