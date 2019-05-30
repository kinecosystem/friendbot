import * as express from 'express';
import { Request, Response } from "express-serve-static-core";
import { Logger } from "./logging";
import { HorizonError } from "@kinecosystem/kin-sdk-node";
import { ClientError } from "./errors";

export interface MiddlewareHandler {
    handler(): express.RequestHandler | express.ErrorRequestHandler;
}

export class NotFoundMiddleware implements MiddlewareHandler {

    private readonly notFoundHandler: express.RequestHandler = function (req: Request, res: Response) {
        res.status(404).send({code: 404, error: "Not found", message: "Not found"});
    } as express.RequestHandler;

    handler() {
        return this.notFoundHandler;
    }
}

export class GeneralErrorMiddleware implements MiddlewareHandler {

    constructor(private readonly logger: Logger) {
        this.logger = logger;
    }

    handler(): express.ErrorRequestHandler {
        return this.generalErrorHandler;
    }

    private readonly generalErrorHandler: express.ErrorRequestHandler = (err: any, req: Request, res: Response, next: express.NextFunction) => {
        if (err instanceof HorizonError) {
            this.HorizonErrorHandler(err, req as express.Request, res);
        } else if (err instanceof ClientError) {
            this.clientErrorHandler(err, req as express.Request, res);
        } else {
            this.serverErrorHandler(err, req as express.Request, res);
        }
    };

    private HorizonErrorHandler(error: HorizonError, req: express.Request, res: express.Response) {
        this.logger.error(`horizon error`, error);
        res.status(error.errorCode).send(error.errorBody);
    }

    private clientErrorHandler(error: ClientError, req: express.Request, res: express.Response) {
        this.logger.error(`client error (4xx)`, error);
        res.status(error.status).send(error.toJson());
    }

    private serverErrorHandler(error: any, req: express.Request, res: express.Response) {
        let message = `Error
	method: ${req.method}
	path: ${req.url}
	payload: ${JSON.stringify(req.body)}
	`;

        if (error instanceof Error) {
            message += `message: ${error.message}
stack: ${error.stack}`;
        } else {
            message += `message: ${error.toString()}`;
        }

        this.logger.error(`server error (5xx)`, {error: message});

        res.status(500).send({code: 500, error: error.message || "Server error", message: error.message});
    }
}
