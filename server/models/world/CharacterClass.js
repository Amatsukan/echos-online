
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import Classes from '../enums/CharacterClasses.js'; // Importa o Enum

// Baseado em "lore/Classes e Povos.md"
export const Class = sequelize.define('Class', {
    name: {
        type: Classes, // Usa o Enum importado
        unique: true,
        allowNull: false 
    },
    description: {
        type: DataTypes.TEXT
    }
    // A foreign key 'civilizationId' será adicionada pela associação
}, {
    timestamps: false
});
