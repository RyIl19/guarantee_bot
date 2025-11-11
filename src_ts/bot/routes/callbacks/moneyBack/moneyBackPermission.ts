import { bot, text } from "../../../index.js";
import Receiver from "../../../../utils/classes/Receiver.js";

const callback : exportedCallback = {
    name: "money_back_permission",
    async exec(query, [ transaction_id ]) {
        if(!query.message || !query.message.from) return;

        await bot.editMessageText(text.t("proceedings.money_back_permission", {
            ns: "transactions"
        }), {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        });

        await Receiver.requestMoneyBack(transaction_id);        
    }
}

export default callback;