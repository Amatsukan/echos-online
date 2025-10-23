
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import EquipmentSlots from '../enums/EquipmentSlots.js'; // Importa o Enum

// Representa um item EQUIPADO por um personagem
export const CharacterEquipment = sequelize.define('CharacterEquipment', {
    slot: {
        type: EquipmentSlots, // Usa o Enum
        allowNull: false
    }
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['characterId', 'slot']
        }
    ]
});
