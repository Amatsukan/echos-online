

import { Character } from '../../../models/index.js';
import { characterData } from '../data/character/characterData.js';

async function seedCharacter(charData, accounts, classes) {
    try {
        return await Character.create({
            ...charData.main,
            accountId: accounts[charData.account].id,
            classId: classes[charData.class].id,
        });
    } catch (err) {
        console.error(`[SEED BANK] Erro ao semear personagem ${charData.main.name} no banco de dados:`, err);
        process.exit(1);
    }
}

export default async function seed_characters(accounts, classes) {
    const promises = characterData.map(charData => seedCharacter(charData, accounts, classes));
    const createdCharacters = await Promise.all(promises);

    // Return a map for easy lookup
    return createdCharacters.reduce((acc, char) => {
        acc[char.name] = char;
        return acc;
    }, {});
}
