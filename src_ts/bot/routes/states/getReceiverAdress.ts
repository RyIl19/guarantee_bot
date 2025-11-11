import { Message } from "node-telegram-bot-api";
import { bot, text, tron } from "../../index.js";
import states from "../../states.js";
import isMessage from "../../../utils/isMessage.js";
import { transactions } from "../../transactions.js";
import shieldText from "../../../utils/shieldText.js";
import roundSum from "../../../utils/roundSum.js";
import config from "../../../../config.json" assert { type: "json" };
import Tron from "../../../utils/classes/Tron.js";

const state : exportedState = {
    name: "GetReceiverAdress",
    async exec(message: Message, [ transaction_id ]) {
        if (!message.from || !message.text) return;
        text.setDefaultNamespace("receiver");

        //Proceeding message
        const proceedingMessage = await bot.sendMessage(message.chat.id, text.t("payment.adress.proceeding_message"), {
            reply_to_message_id: message.message_id
        })
            .catch(err => console.log("❌ Error | Proceeding receiver message wasn't sent! Reason = ", err));

        if (!isMessage(proceedingMessage)) return;
        
        //Checks
        if (!tron.isAddress(message.text)) return await bot.editMessageText(text.t("payment.adress.not_adress"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Error message (not an adress) wasn't sent! Reason = ", err));
        

        //Update transaction
        const transaction = transactions.get(transaction_id);
        if (!transaction || !transaction.sum || !transaction.total_sum) throw new Error("Trasaction wasn't found!!! ID = ", transaction_id);
        transactions.set(transaction_id, {
            ...transaction,
            receiver_adress: message.text
        });

        //Inform receiver
        await bot.editMessageText(text.t("payment.adress.success", { 
            adress: shieldText(message.text) 
        }), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Successful adress receiver setting message wasn't sent! Reason = ", err));
         
        //Inform sender
        text.setDefaultNamespace("transactions");
        const blockTimestamp = await Tron.getCurrentBlockTimestamp(tron);

        await bot.sendMessage(transaction.sender, text.t("payment.request", {
            sum: shieldText(transaction.sum.toString()),
            comission: shieldText(config.comission_fee.toString()),
            total_sum: shieldText(transaction.total_sum.toString()),
            address: (config as any).wallet.address,
            id: shieldText(transaction_id)
        }), {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("payment.buttons.done"),
                            callback_data: `check_crypto_income:${transaction_id}:${blockTimestamp}`
                        }
                    ],
                    [
                        {
                            text: text.t("payment.buttons.cancel"),
                            callback_data: `cancel_transaction:${transaction_id}`
                        }
                    ],
                    [
                        {
                            text: text.t("payment.buttons.problem"),
                            callback_data: `transaction_error:${transaction_id}`
                        }
                    ]
                ]
            }
        });

        //Prepare state
        states.delete(message.from.id);
    }
}

export default state;