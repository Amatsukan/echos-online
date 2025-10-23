
import { Item, Weapon, Armor, Consumable, Material } from "../../models/index.js"
import { ItemTypeEnum } from '../../models/Enums/ItemTypes.js'
import { EquipmentSlotEnum } from '../../models/Enums/EquipmentSlots.js'

async function seedItem(itemData) {
    try {
        const { damage, defense, effects, maxStack, ...baseItemData } = itemData;
        const item = await Item.create(baseItemData);

        if (item.type === ItemTypeEnum.WEAPON && damage) {
            await Weapon.create({ itemId: item.id, damage });
        } else if (item.type === ItemTypeEnum.ARMOR && defense) {
            await Armor.create({ itemId: item.id, defense });
        } else if (item.type === ItemTypeEnum.CONSUMABLE && effects) {
            await Consumable.create({ itemId: item.id, effects, maxStack });
        } else if (item.type === ItemTypeEnum.MATERIAL) {
            await Material.create({ itemId: item.id, maxStack });
        }

        return item;
    } catch (err) {
        console.error(`[SEED BANK] Erro ao semear item ${itemData.name} no banco de dados:`, err);
        process.exit(1);
    }
}

export default async function seed_items() {
    const items = [
        // Armors
        { name: 'Elmo de Ferro', type: ItemTypeEnum.ARMOR, slot: EquipmentSlotEnum.HEAD, defense: 10 },
        { name: 'Peitoral de Aço', type: ItemTypeEnum.ARMOR, slot: EquipmentSlotEnum.CHEST, defense: 25 },
        { name: 'Calças de Couro', type: ItemTypeEnum.ARMOR, slot: EquipmentSlotEnum.LEGS, defense: 8 },
        { name: 'Botas Velhas', type: ItemTypeEnum.ARMOR, slot: EquipmentSlotEnum.FEET, defense: 5 },
        { name: 'Manto Simples', type: ItemTypeEnum.ARMOR, slot: EquipmentSlotEnum.CAPE, defense: 7 },
        { name: 'Armadura de Couro', type: ItemTypeEnum.ARMOR, slot: EquipmentSlotEnum.CHEST, defense: 15 },
        // Weapons
        { name: 'Espada Longa', type: ItemTypeEnum.WEAPON, slot: EquipmentSlotEnum.MAIN_HAND, damage: 15 },
        { name: 'Cajado Básico', type: ItemTypeEnum.WEAPON, slot: EquipmentSlotEnum.MAIN_HAND, damage: 8 },
        { name: 'Adaga Afiada', type: ItemTypeEnum.WEAPON, slot: EquipmentSlotEnum.MAIN_HAND, damage: 12 },
        { name: 'Adaga Curta', type: ItemTypeEnum.WEAPON, slot: EquipmentSlotEnum.OFF_HAND, damage: 10 },
        // Consumables
        { name: 'Maçã', type: ItemTypeEnum.CONSUMABLE, effects: { hp: 10 }, maxStack: 20 },
        { name: 'Poção de HP', type: ItemTypeEnum.CONSUMABLE, effects: { hp: 50 }, maxStack: 10 },
        { name: 'Poção de MP', type: ItemTypeEnum.CONSUMABLE, effects: { mp: 40 }, maxStack: 10 },
        // Materials
        { name: 'Gazuas', type: ItemTypeEnum.MATERIAL, maxStack: 99 },
    ];

    const promises = items.map(seedItem);
    const createdItems = await Promise.all(promises);

    // Return a map for easy lookup
    return createdItems.reduce((acc, item) => {
        acc[item.name] = item;
        return acc;
    }, {});
}
