import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define o caminho para o ficheiro do banco de dados
// Ele será criado em: vahalla-echoes/server/database/vahalla.sqlite
const dbPath = path.join(__dirname, 'vahalla.sqlite');

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: console.log, // Mostra os comandos SQL no console (ótimo para dev)
});