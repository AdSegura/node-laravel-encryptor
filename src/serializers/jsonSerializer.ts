import {Serialize_Interface} from "../contracts/Serialize_Interface";

export class JsonSerializer implements Serialize_Interface {

    /**
     * Serialize
     *
     * @param data
     */
    serialize(data: any): string {
        if(typeof data === 'object')
            return 'j:' + JSON.stringify(data);

        return String(data);
    }

    /**
     * Unserialize
     *  if cannot unserialize return data untouched
     *
     * @param str
     */
    unSerialize(str: string):any {
        if (typeof str !== 'string') return undefined;

        if(JsonSerializer.isJson(str)){
          return JsonSerializer.parseJson(str);
        } else {
            return str;
        }
    }

    /**
     * Parse JSON
     * @param str
     */
    static parseJson(str: string): any{
        try {
            return JSON.parse(str.slice(2))
        } catch (err) {
            return undefined;
        }
    }

    /**
     * Is Json, a la expressJs,
     *  if str is 'j:{"foo": "bar"}' if JSON
     *
     * @param str
     */
    static isJson(str: string): any {
        return str.substr(0, 2) === 'j:'
    }
}
