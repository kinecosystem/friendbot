import {assign, path} from "./utils";
import {LogTarget} from "./logging";

export interface Config {
	port?: number;
	app_name?: string;
	horizon_url: string;
	network_id: string;
	base_seed: string;
	channels_salt: string;
	channels_count: number;
	startingBalance: number;
	loggers?: LogTarget[];
}

export namespace Config {

	export function load(filePath: string): Config {
		const config = assign({}, require(path(filePath!)), {
			app_name: process.env.APP_NAME,
			port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : undefined,
		});

		verifyConfigParam(config.port, "port");
		verifyConfigParam(config.horizon_url, "horizon_url");
		verifyConfigParam(config.network_id, "network_id");
		verifyConfigParam(config.base_seed, "base_seed");
		verifyConfigParam(config.startingBalance, "startingBalance");
		verifyConfigParam(config.channels_count, "channels_count");
		verifyConfigParam(config.channels_salt, "channels_salt");
		return config;
	}

	function verifyConfigParam(param: any, paramName: string) {
		if (!param) {
			throw new Error(`config error! ${paramName} is not defined`);
		}
	}
}
