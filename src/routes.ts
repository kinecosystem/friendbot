import * as express from "express";
import {Request, Response} from "express-serve-static-core";
import {BlockchainService} from "./blockchainService";
import {Logger} from "./logging";
import {performance} from "perf_hooks";

export class Routes {

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
		const amount = req.query.amount;
		const start = performance.now();
		const op_name = create ? "creating account" : "funding account";
		this.logger.info(`${op_name} request. addr = ${address}, amount = ${amount}`);
		let hash;
		if (create) {
			hash = await this.blockchainService.createAccount(req.query.addr, req.query.amount);
		} else {
			hash = await this.blockchainService.fundAccount(req.query.addr, req.query.amount);
		}
		this.logger.info(`${op_name} succeeded in ${performance.now() - start} ms. addr = ${address}, amount = ${amount}`);
		res.status(200).send({hash: hash});
	}
}