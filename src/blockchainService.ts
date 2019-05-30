import { KinAccount } from "@kinecosystem/kin-sdk-node";

export class BlockchainService {

    constructor(private readonly rootAccount: KinAccount) {
        this.rootAccount = rootAccount;
    }

    async createAccount(address: string, amount: number): Promise<string> {
        return await this.rootAccount.channelsPool!.acquireChannel(async (channel) => {
            const builder = await this.rootAccount.buildCreateAccount({
                startingBalance: amount,
                fee: 100,
                address: address,
                channel: channel
            });
            return await this.rootAccount.submitTransaction(builder);
        });
    }

    async fundAccount(address: string, amount: number): Promise<string> {
        return await this.rootAccount.channelsPool!.acquireChannel(async (channel) => {
            const builder = await this.rootAccount.buildSendKin({
                amount: amount,
                fee: 100,
                address: address,
                channel: channel
            });
            return await this.rootAccount.submitTransaction(builder);
        });
    }
}
