import { Server } from "http";
import { Logger } from "./logging";
import { Config } from "./config";
import { FriendBotApp } from "./app";

type ServerError = Error & { syscall: string; code: string; };

const config = Config.load("config/default.json");
const logger = Logger.init(...config.loggers!);
const app = new FriendBotApp(config, logger);

app.init().then(() => {
    const express = app.createExpress();
    const server = express.listen(config.port);
    server.on("error", onError);
    server.on("listening", onListening(server));
}).catch(e => {
    logger.error(`Failed to start server: ${e}`);
    process.exit(1);
});

function cleanup(server: Server) {
    logger.info("Shutting down");
    server.close(() => {
        logger.info("Done, have a great day!");
        process.exit(0);
    });
}

/**
 * Event listener for HTTP server "error" event.
 */
export function onError(error: ServerError) {
    if (error.syscall !== "listen") {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            logger.error(`${config.port} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            logger.error(`${config.port} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
export function onListening(server: Server) {
    return () => {
        const addr = server.address() as { port: number };
        const handler = cleanup.bind(null, server);
        process.on("SIGINT", handler);
        process.on("SIGTERM", handler);
        logger.debug(`Listening on ${addr.port}`);
    };
}
