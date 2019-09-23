"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockSerializer {
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
exports.MockSerializer = MockSerializer;
