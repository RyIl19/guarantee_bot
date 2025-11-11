import { bot, text } from "../../index.js";
import { transactions } from "../../transactions.js";

const callback : exportedCallback = {
    name: "cancel_transaction",
    async exec(query, [ transaction_id ]) {
        if(!query.message || !query.message.from) return;
        text.setDefaultNamespace("transactions");

        const transaction = transactions.get(transaction_id);
        if (!transaction) throw new Error(`❌ Error | Transaction wasn't found. ID = ${transaction_id}`);

        await bot.sendMessage(transaction.sender, text.t("transaction_cancelled", { ns: "receiver" }), {
            parse_mode: "MarkdownV2"
        });

        //Cancel transaction
        transactions.delete(transaction_id);

        //Inform about cancelling
        await bot.editMessageText(text.t("transaction_cancelled"), {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("buttons.back", { ns: "basic" }),
                            callback_data: "menu"
                        }
                    ]
                ]
            }
        })
            .catch(err => console.log("❌ Error | Transaction creating message wasn't sent! Reason = ", err));
    }
}

export default callback;