import Tron from "../../../utils/classes/Tron.js";
import { bot, text, tron } from "../../index.js";
import states from "../../states.js";
import config from "../../../../config.json" assert { type: "json" };
import { transactions } from "../../transactions.js";
import shieldText from "../../../utils/shieldText.js";

const callback : exportedCallback = {
    name: "check_crypto_income",
    async exec(query, [ transaction_id, timestamp ]) {
        if(!query.message || !query.message.from) return;
        text.setDefaultNamespace("transactions");

        //Get info about tron wallet]
        const transactionVerified = await Tron.checkTransaction(tron, transaction_id, +timestamp);
        if (transactionVerified) {
            //Get transaction
            const transaction = transactions.get(transaction_id);
            if (!transaction) return console.log(`❌ Error | Transaction wasn't found! Transaction ID = ${transaction_id}`);

            //Inform receiver
            await bot.sendMessage(transaction.receiver, text.t("payment.inform", {
                ns: "receiver",
                id: shieldText(transaction_id)
            }), {
                parse_mode: "MarkdownV2"
            });

            //Inform user + button
            await bot.editMessageText(text.t("payment.successful_income"), {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
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
                .catch(err => console.log("❌ Error | Successful income user message wasn't sent! Reason = ", err));
        } else {
            //Show help message

            await bot.answerCallbackQuery(query.id, {
                show_alert: true,
                text: text.t("payment.error", {
                    support: config.support_tag
                })
            })
                .catch(err => console.log("❌ Error | Successful income receiver answer callback query wasn't sent! Reason = ", err));
        }
    }
}

export default callback;