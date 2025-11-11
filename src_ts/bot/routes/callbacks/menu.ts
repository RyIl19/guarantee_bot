import { bot, text } from "../../index.js";
import shieldText from "../../../utils/shieldText.js";
import states from "../../states.js";

const callback : exportedCallback = {
    name: "menu",
    async exec(query, [ cancel ]) {
        if(!query.message) return;
        text.setDefaultNamespace("basic");

        //Clean states if necessary
        if (cancel === "cancel") states.delete(query.from.id);

        //Send support message
        await bot.editMessageText(text.t("menu", { id: shieldText(query.from.id.toString()) }), {
            message_id: query.message.message_id,
            chat_id: query.message.chat.id,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: text.t("buttons.create_transaction"),
                            callback_data: "create_transaction"
                        }
                    ],
                    [
                        {
                            text: text.t("buttons.back"),
                            callback_data: "start"
                        }
                    ]
                ]
            }
        })
            .catch(err => console.log("❌ Error | Menu message wasn't sent! Reason = ", err));
    }
}

export default callback;