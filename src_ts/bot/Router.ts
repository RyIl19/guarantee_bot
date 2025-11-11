import fs from "fs";
import TelegramBot from "node-telegram-bot-api";
import { Message, CallbackQuery } from "node-telegram-bot-api";
import states from "./states.js";

declare global {
    type command = (message: Message) => Promise<void | any>;
    type callback = (query: CallbackQuery, args: string[]) => Promise<void | any>;
    type state = (message: Message, args: any[]) => Promise<void | any>;

    type execFunction = command | callback | state;

    interface exportedCommand {
        name: string,
        exec: command
    }

    interface exportedCallback {
        name: string,
        exec: callback
    }

    interface exportedState {
        name: string,
        exec: state
    }
}


class Router {
    static async #get(type : string ) : Promise<Map<string, execFunction>> {
        const data : Map<string, execFunction> = new Map();
        const dir : fs.Dirent[] = fs.readdirSync(`./dist/bot/routes/${type}`, {
            withFileTypes: true
        });

        
        for (const file of dir) {
            if (file.isDirectory()) {
                const inData : Map<string, execFunction> = await this.#get(type + "/" + file.name);
                for (const name of inData.keys()) {
                    data.set(name, inData.get(name) as execFunction);
                }
            } else {
                const info = (await import(`./routes/${type}/${file.name}`)).default;
                data.set(info.name, info.exec);
            }
        }

        return data;
    }

    async route(bot: TelegramBot) {
        const commands = await Router.#get("commands") as Map<string, command>;
        const callbacks = await Router.#get("callbacks") as Map<string, callback>;
        const fileStates = await Router.#get("states") as Map<string, state>;
        bot.on("message", async msg => {
            if (!msg.from) return;
            
            const command = msg.text ? commands.get(msg.text) : null;
            const state = states.get(msg.from.id);

            if (command) {
                states.delete(msg.from.id);
                await command(msg);
                return;
            }

            if (state) {
                const fileState = fileStates.get(state.action);
                if (!fileState) return;

                await fileState(msg, state?.args);
            }
        });

        bot.on("callback_query", async query => {
            if(!query.from || !query.data) return;

            
            const args : string[] = query.data.split(":");
            const queryName : string = args[0];
            args.shift();
            const callback = callbacks.get(queryName);

            if(!callback) return;
            await callback(query, args);
        });
    }
}

export default Router;