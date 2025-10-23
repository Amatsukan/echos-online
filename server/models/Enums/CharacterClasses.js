import { DataTypes } from 'sequelize';

// Baseado no seu lore/Classes e Povos.md
const Classes = DataTypes.ENUM(
    'Bárbaro', 
    'Matemágico', 
    'Bardo'
);

export default Classes;