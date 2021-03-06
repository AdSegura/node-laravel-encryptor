const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const {Encryptor} = require('../../dist');
const cookie = require('cookie');


exports.ExpressServer = class ExpressServer {

    constructor(options) {

        this.options = options;
        this.express = new express();

        (() => {
            this.express.response.cookie_cryp = (name, data, res) => {
                res.cookie(name, this.cipher.encryptSync(data));
            }
        })();

        this.cookie_opt = this.cookie_params(this.options.cookie_opt);
        this.server_id = this.options.server_id;

        if (options.async) {
            if (!options.artillery)
                this.cookieMiddleware = this.cookieAsync(options.cookie, this.server_id);
            else
                this.cookieMiddleware = this.stupidMiddlewareAsync();

        } else {
            if (!options.artillery)
                this.cookieMiddleware = this.cookieSync(options.cookie, this.server_id);
            else
                this.cookieMiddleware = this.stupidMiddlewareSync();
        }

        this.cipher = new Encryptor(this.options);
    }

    cookieSync(cookieName, data) {
        return (req, res, next) => {
            try {
                const enc = this.cipher.encryptSync(data);
                return this.response(cookieName, res, next)(enc)
            } catch (e) {
                return this.errorAndNext(next)(e);
            }
        }
    }

    cookieAsync(cookieName, data) {
        return (req, res, next) => {
            this.cipher
                .encrypt(data)
                .then(this.response(cookieName, res, next))
                .catch(this.errorAndNext(next));
        }
    }

    stupidMiddlewareSync() {
        return (req, res, next) => {
            try {
                res.enc = this.cipher.encryptSync(req.query.id);
                next();
            } catch (e) {
                return this.errorAndNext(next)(e);
            }
        };
    }

    stupidMiddlewareAsync() {
        return (req, res, next) => {
            this.cipher
                .encrypt(req.query.id)
                .then(enc => {
                    res.enc = enc;
                    next();
                })
                .catch(this.errorAndNext(next));
        };
    }

    /**
     *
     * @param name
     * @param res
     * @param next
     */
    response(name, res, next) {
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
    setCookie(name, res) {
        return (payload) => {
            res.cookie(name, payload, this.cookie_opt);
        }
    }

    /**
     * Log Error and Next
     * @param next
     */
     errorAndNext(next) {
        return (error) => {
            console.error(error);
            next(error);
        }
    }

     decipherCookieMiddleware() {
        return (req, res, next) => {
            if (req.cookies['superdope']) {
                console.log('decipherCookieMiddleware')
                //console.log(req.headers)
                const foo = cookie.parse(req.headers.cookie, {
                    decode: (data) => {
                        return this.cipher.decrypt(decodeURIComponent(data), false)
                    }
                });

                console.log(foo)
            }
            next()
        }
    }

    listen(port, cb) {

        //crypto cookie
        this.express.use(cookieParser(null, {
            decode: (data) => {
                return this.cipher.decrypt(decodeURIComponent(data), false);
            },

            encode: (data) => {
                return encodeURIComponent(this.cipher.encryptSync(data));
            }
        }));

        this.express.use(this.cookieMiddleware);
        //this.express.use(this.decipherCookieMiddleware());

        this.express.use(this.logErrors);
        this.express.use(this.clientErrorHandler);
        this.express.use(this.errorHandler);

        this.api();

        this.httpServer = http.createServer(this.express);
        this.server = this.httpServer.listen(port, cb);

        if (!cb) return this.server
    }

    address() {
        return false;
    }

    close(cb) {
        this.server.close(cb);
    }


    api() {
        this.express.get(
            '/',
            (req, res, next) => this.getRoot(req, res, next),
        );

        this.express.get(
            '/integrator',
            (req, res, next) => this.getIntegrator(req, res, next),
        );

        this.express.get(
            '/readcookie',
            (req, res, next) => this.getReadCookie(req, res, next),
        );

        this.express.get(
            '/mid',
            (req, res, next) => this.mid(req, res, next),
        );
    }

    mid(req, res, next) {
        res.cookie_cryp('superdope', {foo: 1111}, res);
        res.json({id: 1});
    }

    /**
     * Outputs a simple message to show that the server is running.
     *
     * @param {any} req
     * @param {any} res
     * @param next
     */
    getRoot(req, res, next) {
        //res.json(res._headers['set-cookie'])
        //res.json(res.getHeaders()['set-cookie'])
        if (!req.query.id) return res.send('error');
        res.json({id: req.query.id, encrypted: res.enc});
    }

    getIntegrator(req, res, next) {
        res.send('ok');
    }

    getReadCookie(req, res, next) {
        res.send(req.cookies['cryptocookie'])
    }

    logErrors(err, req, res, next) {
        console.error(err.stack);
        next(err)
    }

    clientErrorHandler(err, req, res, next) {
        if (req.xhr) {
            res.status(500).send({error: 'Something failed!'})
        } else {
            next(err)
        }
    }

    errorHandler(err, req, res, next) {
        if (process.env.NODE_ENV !== 'development')
            return res.status(500).send({error: 'Something failed!'});

        res.status(500).send({error: err.stack})
    }

    serverId() {
        return this.server_id;
    }

    /**
     * default cookie params
     *
     * @param opt
     */
     cookie_params(opt) {

        const base = {
            domain: 'localhost',
            httpOnly: true,
            path: '/',
            secure: true,
            signed: false,
            sameSite: 'Lax',
            //maxAge: (new Date(Date.now() + 60 * 60 * 1000)).getMilliseconds(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };

        return Object.assign({}, base, opt);
    };
}
