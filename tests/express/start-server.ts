import {ExpressServer} from "./express-server";
const key = 'c0gDOf2wqPLyJ8eZsmEcf8XPRyu24cSPcEZfGs12v78=';

let aSync = false;
let artillery = true;

if(process.argv[2]) aSync = true;
if(process.argv[3]) artillery = false;

class StartServer {
    static start(options, cb?: any){
        const ex = new ExpressServer(options);
        return ex.listen(9999, cb)
    }
}

const options = {
    key,
    server_id: 1,
    aSync,
    artillery,
    cookie:'cryptocookie',
    cookie_opt: {
        secure: false,
        httpOnly: false
    }
}

exports.newServer = StartServer
    .start(options, (server) => {
        console.log(`Server stated in aSync Mode: ${aSync}, Artillery test mode:${artillery}`);
    } );
