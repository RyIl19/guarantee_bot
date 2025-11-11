import { bot, text } from "../../index.js";
import config from "../../../../config.json" assert { type: "json" };
import shieldText from "../../../utils/shieldText.js";

const callback : exportedCallback = {
    name: "support",
    async exec(query) {
        if(!query.message || !query.message.from) return;
        text.setDefaultNamespace("basic");

        //Send support message
        await bot.editMessageText(text.t("support", { support_tag: shieldText(config.support_tag) }), {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("buttons.back"),
                            callback_data: "start"
                        }
                    ]
                ]
            }
        })
            .catch(err => console.log("❌ Error | Support message wasn't sent! Reason = ", err));
    }
}

export default callback;