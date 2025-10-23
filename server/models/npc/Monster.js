
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

export const Monster = sequelize.define('Monster', {
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
    // O campo 'baseStats' (JSON) foi REMOVIDO.
    // Será substituído por uma associação hasOne() para MonsterStats.
    
    // O campo 'lootTable' (JSON) foi REMOVIDO.
    // Será substituído por uma associação hasMany() para LootTableEntry.
}, {
    timestamps: false
});
