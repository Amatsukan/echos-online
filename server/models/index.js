
// Importa a instância do sequelize
import { sequelize } from '../database/database.js';

// Importa todos os modelos
import { Account } from './account/Account.js';
import { Character } from './character/Character.js';
import { CharacterStats } from './character/CharacterStats.js';
import { InventoryItem } from './character/InventoryItem.js';
import { CharacterEquipment } from './character/CharacterEquipment.js';
import { Civilization } from './world/Civilization.js';
import { Class } from './world/CharacterClass.js';
import { Item } from './item/Item.js';
import { Weapon } from './item/Weapon.js';
import { Armor } from './item/Armor.js';
import { Consumable } from './item/Consumable.js';
import { Material } from './item/Material.js';
import { ItemStatBonus } from './item/ItemStatBonus.js';
import { Monster } from './npc/Monster.js';
import { NPC } from './npc/NPC.js';
import { MonsterStats } from './npc/MonsterStats.js';
import { LootTableEntry } from './npc/LootTableEntry.js';
import { DialogueNode } from './dialogue/DialogueNode.js';
import { DialogueChoice } from './dialogue/DialogueChoice.js';

// --- DEFINIR ASSOCIAÇÕES ---

// Item <-> Weapon / Armor / Consumable / Material (Herança)
Item.hasOne(Weapon, { foreignKey: 'itemId', onDelete: 'CASCADE' });
Weapon.belongsTo(Item, { foreignKey: 'itemId' });

Item.hasOne(Armor, { foreignKey: 'itemId', onDelete: 'CASCADE' });
Armor.belongsTo(Item, { foreignKey: 'itemId' });

Item.hasOne(Consumable, { foreignKey: 'itemId', onDelete: 'CASCADE' });
Consumable.belongsTo(Item, { foreignKey: 'itemId' });

Item.hasOne(Material, { foreignKey: 'itemId', onDelete: 'CASCADE' });
Material.belongsTo(Item, { foreignKey: 'itemId' });

// Account <-> Character
Account.hasMany(Character, { foreignKey: 'accountId', onDelete: 'CASCADE' });
Character.belongsTo(Account, { foreignKey: 'accountId' });

// Civilization <-> Class
Civilization.hasMany(Class, { foreignKey: 'civilizationId' });
Class.belongsTo(Civilization, { foreignKey: 'civilizationId' });

// Class <-> Character
Class.hasMany(Character, { foreignKey: 'classId' });
Character.belongsTo(Class, { foreignKey: 'classId' });

// Character <-> CharacterStats
Character.hasOne(CharacterStats, { foreignKey: 'characterId', onDelete: 'CASCADE' });
CharacterStats.belongsTo(Character, { foreignKey: 'characterId' });

// Character <-> InventoryItem <-> Item
Character.hasMany(InventoryItem, { foreignKey: 'characterId', onDelete: 'CASCADE' });
InventoryItem.belongsTo(Character, { foreignKey: 'characterId' });
Item.hasMany(InventoryItem, { foreignKey: 'itemId' });
InventoryItem.belongsTo(Item, { foreignKey: 'itemId' });

// Character <-> CharacterEquipment <-> Item
Character.hasMany(CharacterEquipment, { foreignKey: 'characterId', onDelete: 'CASCADE' });
CharacterEquipment.belongsTo(Character, { foreignKey: 'characterId' });
Item.hasMany(CharacterEquipment, { foreignKey: 'itemId' });
CharacterEquipment.belongsTo(Item, { foreignKey: 'itemId' });

// Item <-> ItemStatBonus
Item.hasMany(ItemStatBonus, { foreignKey: 'itemId', onDelete: 'CASCADE' });
ItemStatBonus.belongsTo(Item, { foreignKey: 'itemId' });

// Monster <-> MonsterStats
Monster.hasOne(MonsterStats, { foreignKey: 'monsterId', onDelete: 'CASCADE' });
MonsterStats.belongsTo(Monster, { foreignKey: 'monsterId' });

// Monster <-> LootTableEntry <-> Item
Monster.hasMany(LootTableEntry, { foreignKey: 'monsterId', onDelete: 'CASCADE' });
LootTableEntry.belongsTo(Monster, { foreignKey: 'monsterId' });
Item.hasMany(LootTableEntry, { foreignKey: 'itemId' });
LootTableEntry.belongsTo(Item, { foreignKey: 'itemId' });

// NPC <-> DialogueNode
NPC.hasMany(DialogueNode, { foreignKey: 'npcId', onDelete: 'CASCADE' });
DialogueNode.belongsTo(NPC, { foreignKey: 'npcId' });
NPC.belongsTo(DialogueNode, { as: 'startNode', foreignKey: 'startDialogueNodeId' });

// DialogueNode <-> DialogueChoice
DialogueNode.hasMany(DialogueChoice, { foreignKey: 'nodeId', onDelete: 'CASCADE' });
DialogueChoice.belongsTo(DialogueNode, { foreignKey: 'nodeId' });
DialogueChoice.belongsTo(DialogueNode, { as: 'nextNode', foreignKey: 'nextNodeId' });


// Exporta tudo
export {
    sequelize,
    Account,
    Character,
    CharacterStats,
    Civilization,
    Class,
    Item,
    Weapon,
    Armor,
    Consumable,
    Material,
    Monster,
    NPC,
    InventoryItem,
    CharacterEquipment,
    ItemStatBonus,
    MonsterStats,
    LootTableEntry,
    DialogueNode,
    DialogueChoice
};
