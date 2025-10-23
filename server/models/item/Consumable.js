
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import { Item } from './Item.js';

export const Consumable = sequelize.define('Consumable', {
    itemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Item,
            key: 'id'
        }
    },
    effects: {
        type: DataTypes.JSON,
        allowNull: false
    },
    maxStack: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 99
    }
}, {
    timestamps: false
});
