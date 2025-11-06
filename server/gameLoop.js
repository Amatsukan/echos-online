import { SAVE_INTERVAL_MS } from './config.js';
import { onlinePlayers } from './handlers/visibilityHandler.js';
import { Character } from './models/index.js';
import { sendGlobalNotification } from './handlers/notificationHandler.js';

/**
 * Salva a posição de um único jogador no banco de dados.
 * @param {object} playerData - Os dados do jogador.
 * @param {string} socketId - O ID do socket do jogador.
 * @returns {Promise<void>}
 */
const savePlayerPosition = (playerData, socketId) => {
    if (!playerData.characterId || !playerData.position) {
        console.warn(`[GameLoop] Dados incompletos para salvar jogador no socket ${socketId} durante save periódico.`);
        return Promise.resolve();
    }

    return Character.update(
        { x: playerData.position.x, y: playerData.position.y },
        { where: { id: playerData.characterId } }
    ).catch(err => {
        console.error(`[GameLoop] Erro ao salvar periodicamente Char ID ${playerData.characterId} (Socket: ${socketId}):`, err);
    });
};

/**
 * Itera sobre todos os jogadores online e salva suas posições.
 */
const saveAllPlayers = async () => {
    if (onlinePlayers.size === 0) {
        return;
    }

    console.log('[GameLoop] Iniciando salvamento periódico de posições...');
    
    const savePromises = Array.from(onlinePlayers.entries()).map(([socketId, playerData]) => 
        savePlayerPosition(playerData, socketId)
    );

    try {
        const results = await Promise.all(savePromises);
        const savedCount = results.filter(r => r).length;

        if (savedCount > 0) {
            console.log(`[GameLoop] ${savedCount} posições salvas periodicamente com sucesso.`);
            sendGlobalNotification("O mundo foi atualizado.");
        } else {
            console.log('[GameLoop] Nenhum jogador precisou de atualização de posição (ou houve erros no salvamento individual).');
        }
    } catch (error) {
        console.error('[GameLoop] Erro geral durante o Promise.all do salvamento periódico:', error);
    }
};

/**
 * Inicia o loop de salvamento periódico das posições dos jogadores.
 */
export function startSaveLoop() {
    console.log(`[GameLoop] Iniciando salvamento periódico a cada ${SAVE_INTERVAL_MS / 1000} segundos.`);
    setInterval(saveAllPlayers, SAVE_INTERVAL_MS);
}
