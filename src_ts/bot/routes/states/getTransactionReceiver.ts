import { Message } from "node-telegram-bot-api";
import { bot, text } from "../../index.js";
import states from "../../states.js";
import isMessage from "../../../utils/isMessage.js";
import { transactions } from "../../transactions.js";
import getRandomString from "../../../utils/getRandomString.js";
import shieldText from "../../../utils/shieldText.js";

const state : exportedState = {
    name: "GetTransactionReceiver",
    async exec(message: Message) {
        if (!message.from || !message.text) return;
        text.setDefaultNamespace("transactions");

        //Proceeding message
        const proceedingMessage = await bot.sendMessage(message.chat.id, text.t("proceedings.proceeding_receiver"), {
            reply_to_message_id: message.message_id
        })
            .catch(err => console.log("❌ Error | Proceeding receiver message wasn't sent! Reason = ", err));

        if (!isMessage(proceedingMessage)) return;
        
        //Checks
        if(isNaN(+message.text) || message.text.includes("-")) return await bot.editMessageText(text.t("errors.is_not_number"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Error message (not number) wasn't sent! Reason = ", err));

        if (message.text.includes("e") || message.text.includes(".")) return await bot.editMessageText(text.t("errors.is_not_ceil"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Error message (not ceil) wasn't sent! Reason = ", err));
        
        if (message.text.length < 5 || message.text.length > 20) return await bot.editMessageText(text.t("errors.wrong_length"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Error message (wrong length) wasn't sent! Reason = ", err));

        //Create transaction
        const transactionID = getRandomString(10)
        transactions.set(transactionID, {
            sender: message.from.id,
            receiver: +message.text
        });

        await bot.editMessageText([
            text.t("get_receiver_id.success", { id: shieldText(message.text) }),
            text.t("get_transaction_sum.request")
        ].join("\n\n"), {
            chat_id: proceedingMessage.chat.id,
            message_id: proceedingMessage.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Successful transaction receiver setting message wasn't sent! Reason = ", err));

        //Prepare state
        states.set(message.from.id, {
            action: "GetTransactionSum",
            args: [ transactionID ]
        });
    }
}

export default state;