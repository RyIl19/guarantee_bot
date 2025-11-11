interface Transaction {
    sender: number,
    receiver: number,
    sum?: number,
    total_sum?: number, // In usdt!!!
    time?: number, //Timestamp
    receiver_adress?: string,
    sender_adress?: string
}

export const transactions = new Map<string, Transaction>();