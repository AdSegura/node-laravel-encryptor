"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonSerializer {
    serialize(data) {
        if (typeof data === 'object')
            return 'j:' + JSON.stringify(data);
        return String(data);
    }
    unSerialize(str) {
        if (typeof str !== 'string')
            return undefined;
        if (JsonSerializer.isJson(str)) {
            return JsonSerializer.parseJson(str);
        }
        else {
            return str;
        }
    }
    static parseJson(str) {
        try {
            return JSON.parse(str.slice(2));
        }
        catch (err) {
            return undefined;
        }
    }
    static isJson(str) {
        return str.substr(0, 2) === 'j:';
    }
}
exports.JsonSerializer = JsonSerializer;
