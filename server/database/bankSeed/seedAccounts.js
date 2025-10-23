
import { Account } from '../../models';

async function seedAccount(accountData) {
    try {
        return await Account.create(accountData);
    } catch (err) {
        console.error(`[SEED BANK] Erro ao semear conta ${accountData.username} no banco de dados:`, err);
        process.exit(1);
    }
}

export default async function seed_accounts() {
    const accounts = [
        { username: 'jogador1', passwordHash: '123' },
        { username: 'admin', passwordHash: 'admin' },
    ];

    const promises = accounts.map(seedAccount);
    const createdAccounts = await Promise.all(promises);

    // Return a map for easy lookup
    return createdAccounts.reduce((acc, account) => {
        acc[account.username] = account;
        return acc;
    }, {});
}
