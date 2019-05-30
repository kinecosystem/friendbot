import * as express from "express";
import { Request, Response } from "express-serve-static-core";
import { BlockchainService } from "./blockchainService";
import { Logger } from "./logging";
import { performance } from "perf_hooks";
import { BadRequest } from "./errors";

export class Routes {

    private readonly MAX_AMOUNT = 10_000;

    constructor(private readonly logger: Logger, private readonly blockchainService: BlockchainService) {
        this.blockchainService = blockchainService;
    }

    public readonly createAccountHandler: express.RequestHandler = async (req: Request, res: Response) => {
        await this.createOrFund(req, res, true);
    };
    public readonly fundAccountHandler: express.RequestHandler = async (req: Request, res: Response) => {
        await this.createOrFund(req, res, false);
    };

    private async createOrFund(req: Request, res: Response, create: boolean) {
        const address = req.query.addr;
        let amount = req.query.amount;
        amount = this.validateQuery(address, amount, create);
        const start = performance.now();
        const op_name = create ? "creating account" : "funding account";
        this.logger.info(`${op_name} request. addr = ${address}, amount = ${amount}`);
        let hash;
        if (create) {
            hash = await this.blockchainService.createAccount(address, amount);
        } else {
            hash = await this.blockchainService.fundAccount(address, amount);
        }
        this.logger.info(`${op_name} succeeded in ${performance.now() - start} ms. addr = ${address}, amount = ${amount}`);
        res.status(200).send({hash: hash});
    }

    private validateQuery(address: any, amount: any, create: boolean) {
        if (!address) {
            throw new BadRequest(`address must be provided.`);
        }
        if (amount) {
            const amountNum = Number.parseFloat(amount);
            if (isNaN(amountNum)) {
                throw new BadRequest("amount must be integer.");
            } else if (amountNum > this.MAX_AMOUNT || amountNum < 0) {
                throw new BadRequest(`amount must be between 0 to ${this.MAX_AMOUNT}.`);
            }
        } else {
            if (!create) {
                throw new BadRequest(`amount must be provided.`);
            } else {
                amount = 0;
            }
        }
        return amount;
    }
}