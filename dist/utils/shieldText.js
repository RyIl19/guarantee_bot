const shieldText = (text) => {
    return text.replace(/[-_*[\]()~`>#+=|{}.!\\]/g, '\\$&');
};
export default shieldText;
