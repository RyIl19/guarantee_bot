import { CallbackQuery } from "node-telegram-bot-api";
import { bot, text } from "../../bot/index.js";
import { transactions } from "../../bot/transactions.js";
import shieldText from "../shieldText.js";

class Receiver {
    /**
     * Send receiver an offer for transaction.
     * @param transaction_id 
     * @param senderMessage Whether to send sender one more message or not
     */
    static async inform(transaction_id: string, callback_query_id?: string) {
        //Get transaction
        const transaction = transactions.get(transaction_id);
        if (!transaction) throw new Error(`Error | Transaction wasn't found! Transaction ID = ${transaction_id}`);

        //Setup text
        text.setDefaultNamespace("receiver")

        await bot.sendMessage(transaction.receiver, text.t("inform.text", {
            sender: shieldText(transaction.sender.toString()),
            sum: shieldText((transaction.sum || 0).toString())
        }), {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("inform.confirm_options.yes"),
                            callback_data: `receiver_agreement:${transaction_id}:1`
                        }
                    ],
                    [
                        {
                            text: text.t("inform.confirm_options.no"),
                            callback_data: `receiver_agreement:${transaction_id}:0`
                        }
                    ]
                ]
            }
        })
            .catch(async _ => {
                //Control for first time
                if (!callback_query_id) {
                    await bot.sendMessage(transaction.sender, text.t("inform.not_delivered"), {
                        parse_mode: "MarkdownV2",
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: text.t("inform.reinform_option"),
                                        callback_data: `reinform_receiver:${transaction_id}`
                                    }
                                ]
                            ]
                        }
                    });
                } else {
                    await bot.answerCallbackQuery(callback_query_id, {
                        text: text.t("inform.reinform_failed"),
                        show_alert: true
                    });
                }
        });
    }

    static async agree(transaction_id: string, query: CallbackQuery) {
        if (!query.message) throw new Error("❌ Error | Callback query has no message included!")
        text.setDefaultNamespace("receiver");

        //Get transaction
        const transaction = transactions.get(transaction_id);
        if (!transaction) throw new Error("❌ Error | Transaction wasn't found!")

        //Inform receiver
        await bot.editMessageText([
            text.t("offer.approved", {
                id: transaction_id
            }),
            text.t("payment.adress.request")
        ].join("\n\n"), {
            chat_id: query.message?.chat.id || query.from.id,
            message_id: query.message?.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Infomration fo receiver wasn't sent. Reason = ", err));

        //Inform sender
        await bot.sendMessage(transaction.sender, text.t("agreement.approved", { ns: "transactions" }), {
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Infomration fo sender wasn't sent. Reason = ", err));
    }

    static async disagree(transaction_id: string, query: CallbackQuery) {
        if (!query.message) throw new Error("❌ Error | Callback query has no message included!")
        text.setDefaultNamespace("receiver");

        //Get transaction
        const transaction = transactions.get(transaction_id);
        if (!transaction) throw new Error("❌Error | Transaction wasn't found!")

        //Inform receiver
        await bot.editMessageText(text.t("offer.declined", {
            id: transaction_id
        }), {
            chat_id: query.message?.chat.id || query.from.id,
            message_id: query.message?.message_id,
            parse_mode: "MarkdownV2"
        })
            .catch(err => console.log("❌ Error | Infomration fo receiver wasn't sent. Reason = ", err));

        //Inform sender
        await bot.sendMessage(transaction.sender, text.t("agreement.declined", { ns: "transactions" }), {
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
            .catch(err => console.log("❌ Error | Infomration fo sender wasn't sent. Reason = ", err));

        //Delete transaction
        transactions.delete(transaction_id);
    }

    /**
     * Send request for receiver about money return
     * @param transaction_id 
     * @returns 
     */
    static async requestMoneyBack(transaction_id: string) {
        text.setDefaultNamespace("receiver");

        //Get transaction
        const transaction = transactions.get(transaction_id);
        if (!transaction) throw new Error(`❌ Error | Transaction wasn't found! Transaction ID = ${transaction_id}`);

        //Inform receiver about cancelling
        await bot.sendMessage(transaction.receiver, text.t("money_back.request", { 
            id: shieldText(transaction_id),
        }), {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("money_back.buttons.approve"),
                            callback_data: `money_back_approve:${transaction_id}`
                        }
                    ],
                    [
                        {
                            text: text.t("money_back.buttons.decline"),
                            callback_data: `money_back_decline:${transaction_id}`
                        }
                    ]
                ]
            }
        })
            .catch(err => console.log("❌ Error | Transaction creating message wasn't sent! Reason = ", err));  
    }
}

export default Receiver;