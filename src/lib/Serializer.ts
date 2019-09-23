import {Serialize_Interface} from "../contracts/Serialize_Interface";

export class Serializer{

    constructor(private driver: Serialize_Interface) {}

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

    /**
     * get driver class name
     */
    getDriverName(){
        return this.driver.constructor.name
    }
}
