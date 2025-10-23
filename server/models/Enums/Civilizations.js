import { DataTypes } from 'sequelize';

// Baseado no seu lore/Civilizations e Povos.md
const Civilizations = DataTypes.ENUM(
    'Nórdicos', 
    'Árabes', 
    'Celtas'
);

export default Civilizations;