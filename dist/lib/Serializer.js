"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Serializer {
    constructor(driver) {
        this.driver = driver;
    }
    serialize(data) {
        if (!data)
            return;
        return this.driver.serialize(data);
    }
    unSerialize(data) {
        if (!data)
            return;
        return this.driver.unSerialize(data);
    }
    getDriverName() {
        return this.driver.constructor.name;
    }
}
exports.Serializer = Serializer;
