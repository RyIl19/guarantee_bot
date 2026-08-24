const isMessage = (value) => {
    return typeof value === "object" && value !== null && "message_id" in value;
};
export default isMessage;
