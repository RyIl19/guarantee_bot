import { Message } from "node-telegram-bot-api";

const isMessage = (value: void | Message): value is Message => {
  return typeof value === "object" && value !== null && "message_id" in value;
}

export default isMessage;