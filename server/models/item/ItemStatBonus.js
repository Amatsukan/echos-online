
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import BasicStats from '../enums/BasicStats.js'; // Importa o Enum

// Representa um bónus de atributo que um item dá
export const ItemStatBonus = sequelize.define('ItemStatBonus', {
    statName: {
        type: BasicStats, // Usa o Enum de Atributos Base
        allowNull: false
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});
