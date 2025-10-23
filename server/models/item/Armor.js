
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import { Item } from './Item.js';

export const Armor = sequelize.define('Armor', {
    itemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Item,
            key: 'id'
        }
    },
    defense: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});
