"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_server_1 = require("./express-server");
const LaravelEncryptor_1 = require("../LaravelEncryptor");
const key = LaravelEncryptor_1.LaravelEncryptor.generateRandomKey();
class StartServer {
    static start(options) {
        const ex = new express_server_1.ExpressServer(options);
        return ex.listen(9999);
    }
}
exports.newServer = StartServer.start({ key, server_id: 1 });
