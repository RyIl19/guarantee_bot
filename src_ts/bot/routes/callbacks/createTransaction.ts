import { bot, text } from "../../index.js";
import states from "../../states.js";

const callback : exportedCallback = {
    name: "create_transaction",
    async exec(query) {
        if(!query.message || !query.message.from) return;
        text.setDefaultNamespace("transactions");

        //Start creating transaction

        //Request receiver id
        await bot.editMessageText(text.t("get_receiver_id.request"), {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("buttons.cancel", { ns: "basic" }),
                            callback_data: "menu:cancel"
                        }
                    ]
                ]
            }
        })
            .catch(err => console.log("❌ Error | Transaction creating message wasn't sent! Reason = ", err));

        //Prepare state
        states.set(query.from.id, {
            action: "GetTransactionReceiver",
            args: []
        });
    }
}

export default callback;