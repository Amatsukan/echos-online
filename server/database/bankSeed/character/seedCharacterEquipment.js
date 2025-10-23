
import { CharacterEquipment } from '../../../models/index.js';
import { characterData } from '../data/character/characterData.js';

async function seedCharacterEquipment(charData, characters, items) {
    try {
        const character = characters[charData.main.name];
        const equipmentPromises = charData.equipment.map(equip => {
            return CharacterEquipment.create({
                characterId: character.id,
                itemId: items[equip.itemName].id,
                slot: equip.slot,
            });
        });
        return Promise.all(equipmentPromises);
    } catch (err) {
        console.error(`[SEED BANK] Erro ao semear equipamentos para o personagem ${charData.main.name} no banco de dados:`, err);
        process.exit(1);
    }
}

export default async function seed_character_equipment(characters, items) {
    const promises = characterData.map(charData => seedCharacterEquipment(charData, characters, items));
    return Promise.all(promises);
}
