
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

// Representa um "nó" de diálogo (uma fala do NPC)
export const DialogueNode = sequelize.define('DialogueNode', {
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
    // Foreign key 'npcId' será adicionada
}, {
    timestamps: false
});
