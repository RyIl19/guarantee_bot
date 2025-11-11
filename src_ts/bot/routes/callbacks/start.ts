import { bot, text } from "../../index.js";

const callback : exportedCallback = {
    name: "start",
    async exec(query) {
        if(!query.message || !query.message.from) return;
        text.setDefaultNamespace("basic");

        //Send support message
        await bot.editMessageText(text.t("start"), {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("buttons.menu"),
                            callback_data: "menu"
                        }
                    ],
                    [
                        {
                            text: text.t("buttons.support"),
                            callback_data: "support"
                        }
                    ]
                ]
            }
        })
            .catch(err => console.log("❌ Error | Start message wasn't sent! Reason = ", err));
    }
}

export default callback;