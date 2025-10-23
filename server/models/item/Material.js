
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import { Item } from './Item.js';

export const Material = sequelize.define('Material', {
    itemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Item,
            key: 'id'
        }
    },
    maxStack: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 99
    }
}, {
    timestamps: false
});
