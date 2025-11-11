import Receiver from "../../../utils/classes/Receiver.js";
import states from "../../states.js";

const callback : exportedCallback = {
    name: "receiver_agreement",
    async exec(query, [ transaction_id, agreed ]) {

        if (+agreed) {
            await Receiver.agree(transaction_id, query);

            //Prepare state
            states.set(query.from.id, {
                action: "GetReceiverAdress",
                args: [ transaction_id ]
            })
        } else {
            await Receiver.disagree(transaction_id, query);
        }       
    } 
}

export default callback;