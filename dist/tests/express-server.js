"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const http = require('http');
const { Encryptor } = require('../../');
const { EncryptorSync } = require('../../');
class ExpressServer {
    constructor(options) {
        this.options = options;
        this.express = new express();
        this.cookie_opt = this.cookie_params(this.options.cookie_opt);
        this.server_id = this.options.server_id;
        if (options.async) {
            this.cookieMiddleware = this.cookieAsync(options.cookie, this.server_id, false);
            this.cipher = new Encryptor(this.options);
        }
        else {
            this.cookieMiddleware = this.cookieSync(options.cookie, this.server_id, false);
            this.cipher = new EncryptorSync(this.options);
        }
    }
    cookieSync(cookieName, data, serialize = true) {
        return (req, res, next) => {
            try {
                const enc = this.cipher.encrypt(data, serialize);
                return this.response(cookieName, res, next)(enc);
            }
            catch (e) {
                return this.errorAndNext(next)(e);
            }
        };
    }
    cookieAsync(cookieName, data, serialize = true) {
        return (req, res, next) => {
            this.cipher
                .encrypt(data, serialize)
                .then(this.response(cookieName, res, next))
                .catch(this.errorAndNext(next));
        };
    }
    stupidMiddleware() {
        return (req, res, next) => {
            next();
        };
    }
    response(name, res, next) {
        return (enc) => {
            this.setCookie(name, res)(enc);
            next();
        };
    }
    setCookie(name, res) {
        return (payload) => {
            res.cookie(name, payload, this.cookie_opt);
        };
    }
    serverId() {
        return this.server_id;
    }
    cookie_params(opt) {
        const base = {
            domain: 'localhost',
            httpOnly: true,
            path: '/',
            secure: true,
            signed: false,
            sameSite: 'Lax',
            maxAge: (new Date(Date.now() + 60 * 60 * 1000)).getMilliseconds(),
        };
        return Object.assign({}, base, opt);
    }
    ;
    errorAndNext(next) {
        return (error) => {
            console.error(error);
            next(error);
        };
    }
    listen(port) {
        this.express.use(this.cookieMiddleware);
        this.express.use(this.logErrors);
        this.express.use(this.clientErrorHandler);
        this.express.use(this.errorHandler);
        this.api();
        this.httpServer = http.createServer(this.express);
        this.server = this.httpServer.listen(port);
        return this.server;
    }
    address() {
        return false;
    }
    close(cb) {
        this.server.close(cb);
    }
    api() {
        this.express.get('/', (req, res, next) => this.getRoot(req, res, next));
    }
    getRoot(req, res, next) {
        res.send('ok');
    }
    logErrors(err, req, res, next) {
        console.error('------ERROR------');
        console.error(err.stack);
        next(err);
    }
    clientErrorHandler(err, req, res, next) {
        if (req.xhr) {
            res.status(500).send({ error: 'Something failed!' });
        }
        else {
            next(err);
        }
    }
    errorHandler(err, req, res, next) {
        if (process.env.NODE_ENV !== 'development')
            return res.status(500).send({ error: 'Something failed!' });
        res.status(500).send({ error: err.stack });
    }
}
exports.ExpressServer = ExpressServer;
