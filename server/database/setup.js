import { sequelize } from './database.js'; // Importa a instância do sequelize
import seedBank from './bankSeed/seed.js'; // Importa a função de seed

/**
 * Sincroniza o banco de dados e executa o seed.
 * Lança um erro em caso de falha.
 */
export async function setupDatabase() {
    try {
        // { force: true } recria tabelas - CUIDADO em produção!
        await sequelize.sync({ force: true });
        console.log('[DATABASE] Tabelas sincronizadas.');
        await seedBank();
        console.log('[DATABASE] Seed concluído.');
    } catch (error) {
        console.error('[DATABASE] Erro durante setup (sync/seed):', error);
        // Propaga o erro para quem chamou (startServer)
        throw new Error(`Falha no setup do banco de dados: ${error.message}`);
    }
}