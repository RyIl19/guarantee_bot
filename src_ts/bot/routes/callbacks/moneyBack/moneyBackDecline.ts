import shieldText from "../../../../utils/shieldText.js";
import { bot, text } from "../../../index.js";
import { transactions } from "../../../transactions.js";

const callback : exportedCallback = {
    name: "money_back_decline",
    async exec(query, [ transaction_id ]) {
        if(!query.message || !query.message.from) return;
        text.setDefaultNamespace("transactions");

        //Get transaction
        const transaction = transactions.get(transaction_id);
        if (!transaction) return console.log(`❌ Error | Transaction wasn't found! Transaction ID = ${transaction_id}`);

        //Inform receiver
        await bot.editMessageText(text.t("money_back.declined", {
            ns: "receiver",
            id: shieldText(transaction_id)
        }), {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Money back operation decline receiver message wasn't sent! Reason = ", err));

        //Inform user
        await bot.sendMessage(transaction.sender, text.t("product.money_return_declined"), {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("product.buttons.success"),
                            callback_data: `product_transfered:${transaction_id}`
                        }
                    ],
                    [
                        {
                            text: text.t("product.buttons.cancel"),
                            callback_data: `money_back_permission:${transaction_id}`
                        }
                    ]
                ]
            }
        })
            .catch(err => console.log("❌ Error | Money back operation declined user message wasn't sent! Reason = ", err));
    }
}

export default callback;