
import { CharacterStats } from '../../../models';
import { characterData } from '../data/character/characterData.js';

async function seedCharacterStat(charData, characters) {
    try {
        const character = characters[charData.main.name];
        return await CharacterStats.create({ 
            ...charData.stats, 
            characterId: character.id 
        });
    } catch (err) {
        console.error(`[SEED BANK] Erro ao semear stats para o personagem ${charData.main.name} no banco de dados:`, err);
        process.exit(1);
    }
}

export default async function seed_character_stats(characters) {
    const promises = characterData.map(charData => seedCharacterStat(charData, characters));
    return Promise.all(promises);
}
