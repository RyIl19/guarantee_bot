import { Message } from "node-telegram-bot-api";
import { bot, text } from "../../index.js";
import states from "../../states.js";
import isMessage from "../../../utils/isMessage.js";
import { transactions } from "../../transactions.js";
import shieldText from "../../../utils/shieldText.js";
import Receiver from "../../../utils/classes/Receiver.js";
import roundSum from "../../../utils/roundSum.js";
import config from "../../../../config.json" assert { type: "json" };

const state : exportedState = {
    name: "GetTransactionSum",
    async exec(message: Message, [ transaction_id ]) {
        if (!message.from || !message.text) return;
        text.setDefaultNamespace("transactions");

        //Proceeding message
        const proceedingMessage = await bot.sendMessage(message.chat.id, text.t("proceedings.proceeding_sum"), {
            reply_to_message_id: message.message_id
        })
            .catch(err => console.log("❌ Error | Proceeding sum message wasn't sent! Reason = ", err));
        if (!isMessage(proceedingMessage)) return;
        
        //Checks
        if(isNaN(+message.text) || message.text.includes("-")) return await bot.editMessageText(text.t("errors.is_not_number"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Error message (not number) wasn't sent! Reason = ", err));

        if (message.text.includes("e") || (message.text.split(".")[1] ? (message.text.split(".")[1].length > 2) : false)) return await bot.editMessageText(text.t("errors.too_long_float"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Error message (too long float) wasn't sent! Reason = ", err));
        
        if (+message.text === 0) return await bot.editMessageText(text.t("errors.is_null"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Error message (was 0) wasn't sent! Reason = ", err));
        

        //Update transaction
        const transaction = transactions.get(transaction_id);
        if (!transaction) throw new Error("Trasaction wasn't found!!! ID = ", transaction_id);
        transactions.set(transaction_id, {
            ...transaction,
            sum: +message.text,
            total_sum: roundSum(+message.text * (1 + +config.comission_fee / 100))
        });

        //Show result
        await bot.editMessageText([
            text.t("get_transaction_sum.success", { sum: shieldText(message.text) }),
            text.t("agreement.inform_sender")
        ].join("\n\n"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2",
        })
            .catch(err => console.log("❌ Error | Successful transaction sum setting message wasn't sent! Reason = ", err));

        //Prepare state
        states.delete(message.from.id);

        //Inform receiver
        await Receiver.inform(transaction_id)
    }
}

export default state;