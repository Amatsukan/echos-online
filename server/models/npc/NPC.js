
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

export const NPC = sequelize.define('NPC', {
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    isQuestGiver: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isMerchant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
    // O campo 'dialogueTree' (JSON) foi REMOVIDO.
    // Será substituído por uma foreign key para o nó inicial do diálogo.
    // Esta foreign key ('startDialogueNodeId') será adicionada em models/index.js
}, {
    timestamps: false
});
