
import { InventoryItem } from '../../../models';
import { characterData } from '../data/character/characterData.js';

async function seedInventoryItem(charData, characters, items) {
    try {
        const character = characters[charData.main.name];
        const inventoryPromises = charData.inventory.map(invItem => {
            return InventoryItem.create({
                characterId: character.id,
                itemId: items[invItem.itemName].id,
                quantity: invItem.quantity,
                position: invItem.position,
            });
        });
        return Promise.all(inventoryPromises);
    } catch (err) {
        console.error(`[SEED BANK] Erro ao semear inventário para o personagem ${charData.main.name} no banco de dados:`, err);
        process.exit(1);
    }
}

export default async function seed_inventory_items(characters, items) {
    const promises = characterData.map(charData => seedInventoryItem(charData, characters, items));
    return Promise.all(promises);
}
