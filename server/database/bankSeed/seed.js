import seed_civilizations from './seedCivilizations.js';
import seed_classes from './seedClasses.js';
import seed_items from './seedItems.js';
import seed_accounts from './seedAccounts.js';
import seed_characters from './character/seedCharacters.js';
import seed_character_stats from './character/seedCharacterStats.js';
import seed_character_equipment from './character/seedCharacterEquipment.js';
import seed_inventory_items from './character/seedInventoryItems.js';

export default async function seedBank() {
    try {
        console.log('[SEED BANK] Iniciando o processo de semeadura do banco de dados...');

        // 1. Seed independent data
        const civilizations = await seed_civilizations();
        console.log('[SEED BANK] Civilizações semeadas com sucesso.');
        
        const items = await seed_items();
        console.log('[SEED BANK] Itens semeados com sucesso.');
        
        const accounts = await seed_accounts();
        console.log('[SEED BANK] Contas semeadas com sucesso.');

        // 2. Seed dependent data
        const classes = await seed_classes(civilizations);
        console.log('[SEED BANK] Classes semeadas com sucesso.');

        // 3. Seed character data
        const characters = await seed_characters(accounts, classes);
        console.log('[SEED BANK] Personagens semeados com sucesso.');

        await seed_character_stats(characters);
        console.log('[SEED BANK] Stats de personagens semeados com sucesso.');

        await seed_character_equipment(characters, items);
        console.log('[SEED BANK] Equipamentos de personagens semeados com sucesso.');

        await seed_inventory_items(characters, items);
        console.log('[SEED BANK] Inventários de personagens semeados com sucesso.');

        console.log('[DATABASE] Dados de teste (seed) criados com sucesso.');
    } catch (err) {
        console.error("[SEED BANK] Erro ao semear o banco de dados:", err);
        process.exit(1); // Exit on error
    }
}