
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

// Representa um item no inventário (mochila) de um personagem
export const InventoryItem = sequelize.define('InventoryItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    // Posição no grid da mochila (0 a 11, por exemplo)
    position: { 
        type: DataTypes.INTEGER,
        allowNull: true 
    }
    // Foreign keys 'characterId' e 'itemId' serão adicionadas
}, {
    timestamps: false
});
