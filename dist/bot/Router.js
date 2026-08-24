import fs from "fs";
import states from "./states.js";
class Router {
    static async #get(type) {
        const data = new Map();
        const dir = fs.readdirSync(`./dist/bot/routes/${type}`, {
            withFileTypes: true
        });
        for (const file of dir) {
            if (file.isDirectory()) {
                const inData = await this.#get(type + "/" + file.name);
                for (const name of inData.keys()) {
                    data.set(name, inData.get(name));
                }
            }
            else {
                const info = (await import(`./routes/${type}/${file.name}`)).default;
                data.set(info.name, info.exec);
            }
        }
        return data;
    }
    async route(bot) {
        const commands = await Router.#get("commands");
        const callbacks = await Router.#get("callbacks");
        const fileStates = await Router.#get("states");
        bot.on("message", async (msg) => {
            if (!msg.from)
                return;
            const command = msg.text ? commands.get(msg.text) : null;
            const state = states.get(msg.from.id);
            if (command) {
                states.delete(msg.from.id);
                await command(msg);
                return;
            }
            if (state) {
                const fileState = fileStates.get(state.action);
                if (!fileState)
                    return;
                await fileState(msg, state?.args);
            }
        });
        bot.on("callback_query", async (query) => {
            if (!query.from || !query.data)
                return;
            const args = query.data.split(":");
            const queryName = args[0];
            args.shift();
            const callback = callbacks.get(queryName);
            if (!callback)
                return;
            await callback(query, args);
        });
    }
}
export default Router;
