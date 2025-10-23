
import { DataTypes } from 'sequelize';

export const ItemTypeEnum = {
    WEAPON: 'WEAPON',
    ARMOR: 'ARMOR',
    CONSUMABLE: 'CONSUMABLE',
    MATERIAL: 'MATERIAL',
    QUEST: 'QUEST'
};

const ItemTypes = DataTypes.ENUM(...Object.values(ItemTypeEnum));

export default ItemTypes;
