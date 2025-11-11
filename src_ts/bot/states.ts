import { User } from "node-telegram-bot-api";

const states : Map<User["id"], { action: string, args: any[]}>= new Map();
export default states;