const express = require('express');
const http = require('http');
const {Encryptor} = require('../../');
const {EncryptorSync} = require('../../');

export class ExpressServer {
    private express: any;
    private httpServer: any;
    private server: any;
    private cipher: any;
    private cookie_opt: any;
    protected server_id: any;
    private cookieMiddleware: (req, res, next) => void;
    private host: any;

    constructor(private options: any){

        this.express = new express();
        this.cookie_opt = this.cookie_params(this.options.cookie_opt);
        this.server_id = this.options.server_id;

        if(options.async) {
            this.cookieMiddleware = this.cookieAsync(options.cookie, this.server_id, false);
            this.cipher = new Encryptor(this.options);
        } else {
            this.cookieMiddleware = this.cookieSync(options.cookie, this.server_id, false);
            this.cipher = new EncryptorSync(this.options);
        }
    }

    cookieSync(cookieName: string, data: any, serialize: boolean = true){
        return (req, res, next) => {
            try {
                const enc = this.cipher.encrypt(data, serialize);
                return this.response(cookieName, res, next)(enc)
            } catch(e){
                return this.errorAndNext(next)(e);
            }
        }
    }

    cookieAsync(cookieName: string, data: any, serialize: boolean = true){
        return (req, res, next) => {
            this.cipher
                .encrypt(data, serialize)
                .then(this.response(cookieName, res, next))
                .catch(this.errorAndNext(next));
        }
    }

    /**
     *
     * @param name
     * @param res
     * @param next
     */
    private response(name, res, next) {
        return (enc) => {
            this.setCookie(name, res)(enc);
            next();
        }
    }

    /**
     * Set Cookie res
     *
     * @param name
     * @param res
     */
    private setCookie(name, res) {
        return (payload) => {
            res.cookie(name, payload, this.cookie_opt);
        }
    }

    serverId(){
        return this.server_id;
    }

    /**
     * default cookie params
     *
     * @param opt
     */
    private cookie_params(opt?: any) {

        const base = {
            domain: 'localhost',
            httpOnly: true,
            path: '/',
            secure: true,
            signed: false,
            sameSite: 'Lax',
            maxAge: (new Date(Date.now() + 60 * 60 * 1000)).getMilliseconds(),
            //expires: new Date(Date.now() + 60 * 60 * 1000),
        };

        return Object.assign({}, base, opt);
    };

    /**
     * Log Error and Next
     * @param next
     */
    private errorAndNext(next) {
        return (error) => {
            console.error(error);
            next(error);
        }
    }

    listen(port: number): any{
            this.express.use(this.cookieMiddleware);
            this.express.use(this.logErrors);
            this.express.use(this.clientErrorHandler);
            this.express.use(this.errorHandler);

            this.api();

            this.httpServer = http.createServer(this.express);
            this.server = this.httpServer.listen(port);
            return this.server
    }

    address(){
        return false;
    }

    close(cb?: any){
        this.server.close(cb);
    }


    api(){
        this.express.get(
            '/',
            (req, res, next) => this.getRoot(req, res, next),
        );
    }

    /**
     * Outputs a simple message to show that the server is running.
     *
     * @param {any} req
     * @param {any} res
     * @param next
     */
    getRoot(req: any, res: any, next: any) {
        //res.json(res._headers['set-cookie'])
        //res.json(res.getHeaders()['set-cookie'])
        res.send('ok');
    }

    logErrors(err, req, res, next){
        console.error('------ERROR------');
        console.error(err.stack);
        next(err)
    }

    clientErrorHandler(err, req, res, next){
        if (req.xhr) {
            res.status(500).send({ error: 'Something failed!' })
        } else {
            next(err)
        }
    }

    errorHandler (err, req, res, next) {
        if(process.env.NODE_ENV !== 'development')
            return res.status(500).send({ error: 'Something failed!' });

        res.status(500).send({error: err.stack})
    }
}
