import Tron from "../../../utils/classes/Tron.js";
import { bot, text, tron } from "../../index.js";
import { transactions } from "../../transactions.js";

const callback : exportedCallback = {
    name: "product_transfered",
    async exec(query, [ transaction_id ]) {
        if(!query.message || !query.message.from) return;
        text.setDefaultNamespace("transactions");

        //Send money to receiver
        const transactionSent = await Tron.sendMoneyToReceiver(tron, transaction_id);

        //Get transaction
        const transaction = transactions.get(transaction_id);
        if (!transaction) return console.log(`❌ Error | Transaction wasn't found! Transaction ID = ${transaction_id}`);

        if (transactionSent) {
            //Inform user
            await bot.editMessageText(text.t("product.money_transfered", {
                id: transaction_id
            }), {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
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
                .catch(err => console.log("❌ Error | Product transfered user message wasn't sent! Reason = ", err));

            //Inform receiver
            await bot.sendMessage(transaction.receiver, text.t("payment.done", {
                ns: "receiver",
                id: transaction_id
            }), {
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
                .catch(err => console.log("❌ Error | Product transfered receiver message wasn't sent! Reason = ", err));

            //Clear transaction
            transactions.delete(transaction_id);
        } else {
            //Inform user
            await bot.answerCallbackQuery(query.id, {
                text: text.t("product.error"),
                show_alert: true
            });
        }
    }
}

export default callback;