
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

// Representa uma entrada na tabela de loot de um monstro
export const LootTableEntry = sequelize.define('LootTableEntry', {
    dropChance: {
        type: DataTypes.FLOAT, // 0.0 a 1.0 (ex: 0.25 = 25%)
        allowNull: false
    },
    minQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    maxQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
    // Foreign keys 'monsterId' e 'itemId' serão adicionadas
}, {
    timestamps: false
});
