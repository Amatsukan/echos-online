
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

export const Character = sequelize.define('Character', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    // Os atributos compostos da v1 (hp, mana) vêm para aqui.
    // Os atributos base (força, etc.) ficam em CharacterStats.
    hp: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    maxHp: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    mp: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    maxMp: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    }
    // Os campos 'stats', 'equipment' e 'inventory' (JSON) foram REMOVIDOS.
    // Eles serão substituídos por associações hasMany().
}, {
    timestamps: false
});
