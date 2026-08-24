import { bot, text } from "../../index.js";
const command = {
    name: "/start",
    async exec(message) {
        if (!message.from)
            return;
        text.setDefaultNamespace("basic");
        //Send greeting message
        await bot.sendMessage(message.chat.id, text.t("start"), {
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
};
export default command;
