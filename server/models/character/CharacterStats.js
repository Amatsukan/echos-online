
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

// Baseado em "lore/Atributos.md"
export const CharacterStats = sequelize.define('CharacterStats', {
    // A foreign key 'characterId' será a Primary Key (One-to-One)
    str: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    int: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    dex: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    con: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: false
});
