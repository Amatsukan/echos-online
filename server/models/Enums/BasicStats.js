import { DataTypes } from 'sequelize';

// Baseado no seu lore/Atributos.md
// Usado em ItemStatBonus
const BasicStats = DataTypes.ENUM(
    'str', 
    'con', 
    'dex', 
    'int'
    // Você pode adicionar atributos compostos aqui também
    // 'maxHp', 'maxMp', 'defesa', 'atk_fisico'
);

export default BasicStats;