import {ExpressServer} from "./express-server";
import {LaravelEncryptor} from "../LaravelEncryptor";
//const key = LaravelEncryptor.generateRandomKey();
const key = 'c0gDOf2wqPLyJ8eZsmEcf8XPRyu24cSPcEZfGs12v78=';

let aSync = false;

if(process.argv[2]) aSync = true;

class StartServer {
    static start(options, cb?: any){
        const ex = new ExpressServer(options);
        return ex.listen(9999, cb)
    }
}

exports.newServer = StartServer
    .start({
        key,
        server_id: 1,
        aSync,
        artillery: true
    });
