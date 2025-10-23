
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import { Item } from './Item.js';

export const Weapon = sequelize.define('Weapon', {
    itemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Item,
            key: 'id'
        }
    },
    damage: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});
