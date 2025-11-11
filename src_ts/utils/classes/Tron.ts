import { TronWeb } from "tronweb";
import fs from "fs";
import config from "../../../config.json" assert { type: "json" };
import axios, { AxiosResponse } from "axios";
import { transactions } from "../../bot/transactions.js";

interface USDTTransferDetails {
    /**
     * In Base58
     */
    address_to: string,
    /**
     * In Base58
     */
    address_from: string,
    /**
     * In energy
     */
    value: number
}

class Tron {
    static async init (apiKey: string, privateKey ?: string) {
        if (privateKey) {
            return new TronWeb({
                fullHost: config.network,
                headers: { "TRON-PRO-API-KEY": apiKey },
                privateKey: privateKey
            });
        } else {
            const tron = new TronWeb({
                fullHost: config.network,
                headers: { "TRON-PRO-API-KEY": apiKey },
            });
            //Create account
            const account = await tron.createAccount()
            
            //Save the account info

            //Save private key
            const env = [
                `BOT_TOKEN=${process.env.BOT_TOKEN}`,
                `TRON_API_KEY=${process.env.TRON_API_KEY}`,
                `TRON_PRIVATE_KEY=${account.privateKey}`
            ].join("\n");
            fs.writeFileSync("./process.env", env);
                
            //Save other info
            const updatedConfig = {
                ...config,
                wallet: {
                    address: account.address.base58,
                    publicKey: account.publicKey
                }
            }
            fs.writeFileSync("./config.json", JSON.stringify(updatedConfig, null, 2));

            //Return ready tron
            return new TronWeb({
                fullHost: config.network,
                headers: { "TRON-PRO-API-KEY": apiKey },
                privateKey: account.privateKey
            });
        }
    }

    static async getCurrentBlockTimestamp(tron: TronWeb) : Promise<number> {
        const block = await tron.trx.getCurrentBlock();
        return block.block_header.raw_data.timestamp;
    }

    static async checkTransaction(tron: TronWeb, transaction_id: string, timestamp: number) : Promise<boolean> {
        //Get info about transaction
        const transactionInfo = transactions.get(transaction_id);
        console.log(transactionInfo);
        if(!transactionInfo) return false;

        //Describe response
        interface TransactionInfo {
            data: {
                [key: string]: any,
                raw_data: any
            }[],
            [key: string]: any
        }
        
        //Get transactions list
        const response = await axios.get<any, AxiosResponse<TransactionInfo>>(`${config.network}/v1/accounts/${config.wallet.address}/transactions/trc20`, {
            params: {
                only_to: true,
                min_timestamp: timestamp
            },
            headers: {
                Accept: "application/json"
            }
        })
            .catch(err => console.log(err, "\n❌ Error | Axios error in getting transaction by adress!!!\nDetails up"));

        if (!response) return false;
        //Format response
        const transactionsInfo = response.data.data;

        //Check for correct result
        return transactionsInfo.find(async (transaction: any) => {
            if(!transactionInfo.total_sum) return false;
            transactionInfo.sender_adress = transaction.from;
            console.log("Transaction from first request", transaction);

            if (+transaction.value === transactionInfo.total_sum * (10**6) && transaction.type === "Transfer" && +transaction.block_timestamp >= timestamp) {
                const response = await axios.post(`${config.network}/wallet/gettransactionbyid`, {
                    value: transaction.transaction_id,
                    visible: true
                })
                    .catch(err => console.log(err, "\n❌ Error | Axios error in getting transaction by id!!!\nDetails up"));
                console.log(response?.data); //Delete later!!!!!!!!!!!!!!!!!!!!!!!!!!
                if (!response) return false;

                //Last check
                if (tron.toAscii(response?.data?.raw_data?.data || "") === transaction_id) return true;

                return false;
            } else {
                return false;
            }
        }) ? true : false;
    }

    static async #sendUSDT(tron: TronWeb, details: USDTTransferDetails) {
        //Create transaction
        const tx = await tron.transactionBuilder.triggerSmartContract(config.usdt_contract_adress, "transfer(address,uint256)", {}, [
            {
                type: "address",
                value: details.address_to
            },
            {
                type: "uint256",
                value: details.value
            }
        ], tron.address.toHex(details.address_from));

        //Sign transaction
        const signed = await tron.trx.sign(tx.transaction);
        return await tron.trx.sendRawTransaction(signed);
    }

    static async sendMoneyToReceiver(tron: TronWeb, transaction_id: string) : Promise<boolean> {
        //Get info about transaction
        const transaction = transactions.get(transaction_id);
        if(!transaction || !transaction.sum || !transaction.receiver_adress) return false;

        const result = await Tron.#sendUSDT(tron, {
            address_to: transaction.receiver_adress,
            address_from: config.wallet.address,
            value: transaction.sum * (10**6)
        });

        return result.txid ? true : false;
    }

    static async sendMoneyBackToSender(tron: TronWeb, transaction_id: string) {
        //Get info about transaction
        const transaction = transactions.get(transaction_id);
        if(!transaction || !transaction.sum || !transaction.sender_adress) return false;

        const result = await Tron.#sendUSDT(tron, {
            address_to: transaction.sender_adress,
            address_from: config.wallet.address,
            value: transaction.sum * (10**6)
        });

        return result.txid ? true : false;
    }
}

export default Tron;