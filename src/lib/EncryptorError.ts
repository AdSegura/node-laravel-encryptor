export class EncryptorError extends Error {
    constructor(args){
        super(args);
        this.name = "EncryptorError"
    }
}
