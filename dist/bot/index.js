import TelegramBot from "node-telegram-bot-api";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import Tron from "../utils/classes/Tron.js";
(await import("dotenv")).config({ path: "./process.env" });
//Create bot
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN)
    throw new Error("❌ Bot token wasn't found!");
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
//Create text
const text = i18next.createInstance();
await text
    .use(Backend)
    .init({
    fallbackLng: "en",
    ns: ["basic", "transactions", "receiver"],
    ignoreJSONStructure: false,
    keySeparator: ".",
    backend: {
        loadPath: "./messages/{{lng}}/{{ns}}.json"
    }
});
//Create tron
const tronApiKey = process.env.TRON_API_KEY;
if (!tronApiKey)
    throw new Error("❌ Tron api key wasn't found!");
const tronPrivateKey = process.env.TRON_PRIVATE_KEY;
const tron = await Tron.init(tronApiKey, tronPrivateKey);
export { bot, text, tron };
