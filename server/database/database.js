import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'vahalla.sqlite');

const dbConfig = {
    dialect: 'sqlite',
    storage: dbPath,
    logging: console.log, 
};

export const sequelize = new Sequelize(dbConfig);
