import { mapService } from '../services/mapService.js'; // Para TILE_SIZE se necessário

// --- Configuração ---
const VISION_RANGE = 20; // Raio de visão em tiles

// --- Estado Interno ---
let ioInstance = null;
export const onlinePlayers = new Map(); // Guarda { characterId, name, position, socket } por socket.id

// --- Funções Auxiliares ---

/** Verifica se pos2 está dentro do range de pos1 */
function isWithinRange(pos1, pos2) {
    if (!pos1 || !pos2) return false;
    const distanceX = Math.abs(pos1.x - pos2.x);
    const distanceY = Math.abs(pos1.y - pos2.y);
    return distanceX <= VISION_RANGE && distanceY <= VISION_RANGE;
}

/** Obtém os dados essenciais do jogador para enviar a outros */
function getPlayerData(playerData) {
    if (!playerData) return null;
    return {
        characterId: playerData.characterId,
        x: playerData.position.x,
        y: playerData.position.y,
        name: playerData.name // (Opcional, mas útil)
        // Adicionar sprite, etc. no futuro
    };
}

// --- Funções Principais ---

/** Inicializa o handler com a instância do Socket.IO */
export function initializeVisibilityHandler(io) {
    ioInstance = io;
    console.log('[VisibilityHandler] Inicializado.');
}

/** Chamado quando um jogador entra no jogo */
export function handlePlayerJoin(socket) {
    if (!ioInstance) return;

    const playerData = {
        characterId: socket.data.characterId,
        name: socket.data.characterDetails?.name || 'Desconhecido',
        position: socket.data.characterPosition,
        socket: socket // Guarda a referência do socket
    };

    if (!playerData.characterId || !playerData.position) {
         console.error('[VisibilityHandler] Tentativa de adicionar jogador sem dados essenciais:', socket.id);
         return;
    }

    // 1. Adiciona o novo jogador ao nosso registo
    onlinePlayers.set(socket.id, playerData);
    console.log(`[VisibilityHandler] Jogador ${playerData.name} (${socket.id}) adicionado.`);

    const newPlayerData = getPlayerData(playerData);
    const visibleToNewPlayer = []; // Lista de quem o novo jogador vê

    // 2. Itera pelos jogadores JÁ online
    onlinePlayers.forEach((otherPlayerData, otherSocketId) => {
        if (otherSocketId === socket.id) return; // Ignora a si mesmo

        // Verifica se o outro jogador está no range do novo
        if (isWithinRange(playerData.position, otherPlayerData.position)) {
            // a) Adiciona o outro jogador à lista de visíveis para o novo
            visibleToNewPlayer.push(getPlayerData(otherPlayerData));

            // b) Avisa o outro jogador sobre o novo jogador
            otherPlayerData.socket.emit('player:new', newPlayerData);
             console.log(`[VisibilityHandler] Notificando ${otherPlayerData.name} sobre ${playerData.name}`);
        }
    });

    // 3. Envia a lista de jogadores visíveis para o novo jogador
    if (visibleToNewPlayer.length > 0) {
        console.log(`[VisibilityHandler] Enviando ${visibleToNewPlayer.length} jogadores para ${playerData.name}`);
        // (Otimização futura: Enviar como um único evento 'players:list')
        visibleToNewPlayer.forEach(pData => socket.emit('player:new', pData));
    }
}

/** Chamado quando um jogador se move com sucesso */
export function handlePlayerMove(socket, oldPos) {
    if (!ioInstance || !onlinePlayers.has(socket.id)) return;

    const movedPlayerData = onlinePlayers.get(socket.id);
    // Atualiza a posição no nosso registo (socket.data já foi atualizado no movementHandler)
    movedPlayerData.position = socket.data.characterPosition;
    const newPos = movedPlayerData.position;
    const movedPlayerPublicData = getPlayerData(movedPlayerData); // Dados a enviar

    // Itera por todos os outros jogadores online
    onlinePlayers.forEach((otherPlayerData, otherSocketId) => {
        if (otherSocketId === socket.id) return; // Ignora a si mesmo

        const otherPlayerPublicData = getPlayerData(otherPlayerData);

        // Verifica visibilidade antes e depois
        const wasVisible = isWithinRange(oldPos, otherPlayerData.position);
        const isVisible = isWithinRange(newPos, otherPlayerData.position);

        if (!wasVisible && isVisible) {
            // ENTROU NA VISÃO
             console.log(`[VisibilityHandler] ${otherPlayerData.name} entrou na visão de ${movedPlayerData.name}`);
            movedPlayerData.socket.emit('player:new', otherPlayerPublicData);
            otherPlayerData.socket.emit('player:new', movedPlayerPublicData);
        } else if (wasVisible && !isVisible) {
            // SAIU DA VISÃO
             console.log(`[VisibilityHandler] ${otherPlayerData.name} saiu da visão de ${movedPlayerData.name}`);
            movedPlayerData.socket.emit('player:quit', { characterId: otherPlayerData.characterId });
            otherPlayerData.socket.emit('player:quit', { characterId: movedPlayerData.characterId });
        } else if (isVisible) {
             // PERMANECEU VISÍVEL - Apenas envia a atualização de posição
             // (Nota: movementHandler não envia mais 'player:moved', então fazemos aqui)
             otherPlayerData.socket.emit('player:moved', {
                 characterId: movedPlayerData.characterId,
                 x: newPos.x,
                 y: newPos.y
             });
        }
    });
}

/** Chamado quando um jogador se desconecta */
export function handlePlayerDisconnect(socketId) {
    if (!ioInstance || !onlinePlayers.has(socketId)) return;

    const disconnectedPlayerData = onlinePlayers.get(socketId);
    const disconnectedPlayerId = disconnectedPlayerData.characterId;

    // 1. Remove o jogador do nosso registo
    onlinePlayers.delete(socketId);
    console.log(`[VisibilityHandler] Jogador ${disconnectedPlayerData.name} (${socketId}) removido.`);

    // 2. Notifica os jogadores que ainda estão online e VIAM o jogador que saiu
    onlinePlayers.forEach((otherPlayerData) => {
        // Verifica se o jogador que saiu estava no range do outro jogador
        // (Usa a última posição conhecida do jogador que saiu)
        if (isWithinRange(disconnectedPlayerData.position, otherPlayerData.position)) {
             console.log(`[VisibilityHandler] Notificando ${otherPlayerData.name} sobre a saída de ${disconnectedPlayerData.name}`);
            otherPlayerData.socket.emit('player:quit', { characterId: disconnectedPlayerId });
        }
    });
}