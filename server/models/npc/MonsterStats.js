
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

// Representa os atributos de um monstro
export const MonsterStats = sequelize.define('MonsterStats', {
    // A foreign key 'monsterId' será a Primary Key (One-to-One)
    hp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    atk: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    def: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    exp: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
    // Pode adicionar mais stats aqui (imunidades, etc.)
}, {
    timestamps: false
});
