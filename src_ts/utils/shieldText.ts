const shieldText = (text : string) : string => {
  return text.replace(/[-_*[\]()~`>#+=|{}.!\\]/g, '\\$&');
}

export default shieldText;