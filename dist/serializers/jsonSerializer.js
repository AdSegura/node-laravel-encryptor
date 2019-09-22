"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonSerializer {
    serialize(data) {
        return JSON.stringify(data);
    }
    unSerialize(data) {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return data;
        }
    }
}
exports.JsonSerializer = JsonSerializer;
