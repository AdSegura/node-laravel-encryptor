import {ExpressServer} from "./express-server";
import {LaravelEncryptor} from "../LaravelEncryptor";
const key = LaravelEncryptor.generateRandomKey();

class StartServer {
    static start(options){
        const ex = new ExpressServer(options);
        return ex.listen(9999)
    }
}

exports.newServer = StartServer.start({key, server_id: 1});
