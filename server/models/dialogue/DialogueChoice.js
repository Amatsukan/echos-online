
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';

// Representa uma "escolha" do jogador nesse nó de diálogo
export const DialogueChoice = sequelize.define('DialogueChoice', {
    choiceText: {
        type: DataTypes.STRING,
        allowNull: false
    }
    // Foreign key 'nodeId' (de qual nó esta escolha pertence)
    // Foreign key 'nextNodeId' (para qual nó esta escolha leva)
}, {
    timestamps: false
});
