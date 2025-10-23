
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

// Baseado em "lore/Classes e Povos.md"
export const Civilization = sequelize.define('Civilization', {
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false // "nordicos", "arabes", "celtas"
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: false
});
