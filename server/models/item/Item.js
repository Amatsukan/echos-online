
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import ItemTypes from '../enums/ItemTypes.js';
import EquipmentSlots from '../enums/EquipmentSlots.js';

// Este é o seu modelo "itemBase"
export const Item = sequelize.define('Item', {
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    type: {
        type: ItemTypes, // Usa o Enum
        allowNull: false
    },
    slot: {
        type: EquipmentSlots, // Usa o Enum
        allowNull: true // É nulo se não for equipável (ex: Poção)
    }
}, {
    timestamps: false
});
