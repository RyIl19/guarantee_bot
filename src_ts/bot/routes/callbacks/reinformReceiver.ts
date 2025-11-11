import Receiver from "../../../utils/classes/Receiver.js";

const callback : exportedCallback = {
    name: "reinform_receiver",
    async exec(query, [ transaction_id ]) {
        await Receiver.inform(transaction_id, query.id);
    }
}

export default callback;