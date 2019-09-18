"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_server_1 = require("./express-server");
const key = 'c0gDOf2wqPLyJ8eZsmEcf8XPRyu24cSPcEZfGs12v78=';
let aSync = false;
if (process.argv[2])
    aSync = true;
class StartServer {
    static start(options, cb) {
        const ex = new express_server_1.ExpressServer(options);
        return ex.listen(9999, cb);
    }
}
exports.newServer = StartServer
    .start({
    key,
    server_id: 1,
    aSync,
    artillery: true
});
