import { bot } from "./bot/index.js";
import Router from "./bot/Router.js";

console.log("Info | Trying start the bot");


const router = new Router();
try {
    await router.route(bot);

    console.log("Info | ✅ Bot successfully started!");
} catch (err) {
    console.log("Error |\n", err);
}