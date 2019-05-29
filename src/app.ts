import * as express from 'express';
import "express-async-errors"; // handle any unhandled async/await errors in any middleware, so general error
// handler can catch it
import {Config} from "./config";
import {Logger} from "./logging";
import {GeneralErrorMiddleware, NotFoundMiddleware} from "./middleware";
import {Routes} from "./routes";
import {Channels, Environment, KinClient} from '@kinecosystem/kin-sdk-node';
import {BlockchainService} from "./blockchainService";

export class FriendBotApp {

	private kinClient?: KinClient;
	private routes?: Routes;

	public constructor(public readonly config: Config,
					   public readonly logger: Logger) {
		this.config = config;
	}

	public async init() {
		const env = new Environment({
			url: this.config.horizon_url,
			passphrase: this.config.network_id,
			name: "Friendbot"
		});
		this.logger.info("Creating channels...");
		const channelsKeyPairs = await Channels.createChannels({
			environment: env,
			baseSeed: this.config.base_seed,
			channelsCount: this.config.channels_count,
			startingBalance: this.config.startingBalance,
			salt: this.config.channels_salt,
		});
		this.logger.info("Channels created successfully.");
		this.kinClient = new KinClient(env);
		const kinAccount = this.kinClient.createKinAccount({
			seed: this.config.base_seed,
			channelSecretKeys: channelsKeyPairs.map(keypair => keypair.seed),
			appId: "frnd"
		});
		const blockchainService = new BlockchainService(kinAccount);
		this.routes = new Routes(this.logger, blockchainService);
	}

	public createExpress(): express.Express {
		const app = express();

		app.set('port', this.config.port);

		const bodyParser = require("body-parser");
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({extended: false}));

		this.createRoutes(app);
		// catch 404
		app.use(new NotFoundMiddleware().handler());
		// catch errors (depends on express-async-errors)
		app.use(new GeneralErrorMiddleware(this.logger).handler());
		return app;
	}

	private createRoutes(app: express.Express) {
		app.get('/', this.routes!.createAccountHandler);
		app.get('/fund', this.routes!.fundAccountHandler);
	}
}
