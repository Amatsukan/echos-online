import { mapService } from '../services/mapService.js';

const VISION_RANGE = 20;

let ioInstance = null;
export const onlinePlayers = new Map();

function isWithinRange(pos1, pos2) {
    if (!pos1 || !pos2) return false;
    const distanceX = Math.abs(pos1.x - pos2.x);
    const distanceY = Math.abs(pos1.y - pos2.y);
    return distanceX <= VISION_RANGE && distanceY <= VISION_RANGE;
}

function getPlayerData(playerData) {
    if (!playerData) return null;
    return {
        characterId: playerData.characterId,
        x: playerData.position.x,
        y: playerData.position.y,
        name: playerData.name,
    };
}

function addPlayer(socket) {
    const playerData = {
        characterId: socket.data.characterId,
        name: socket.data.characterDetails?.name || 'Desconhecido',
        position: socket.data.characterPosition,
        socket: socket,
    };

    if (!playerData.characterId || !playerData.position) {
        console.error('[VisibilityHandler] Tentativa de adicionar jogador sem dados essenciais:', socket.id);
        return null;
    }

    onlinePlayers.set(socket.id, playerData);
    console.log(`[VisibilityHandler] Jogador ${playerData.name} (${socket.id}) adicionado.`);
    return playerData;
}

function notifyPlayersOfNewJoin(newPlayerData, socket) {
    const newPlayerPublicData = getPlayerData(newPlayerData);
    const visibleToNewPlayer = [];

    onlinePlayers.forEach((otherPlayerData, otherSocketId) => {
        if (otherSocketId === socket.id) return;

        if (isWithinRange(newPlayerData.position, otherPlayerData.position)) {
            visibleToNewPlayer.push(getPlayerData(otherPlayerData));
            otherPlayerData.socket.emit('player:new', newPlayerPublicData);
            console.log(`[VisibilityHandler] Notificando ${otherPlayerData.name} sobre ${newPlayerData.name}`);
        }
    });

    if (visibleToNewPlayer.length > 0) {
        console.log(`[VisibilityHandler] Enviando ${visibleToNewPlayer.length} jogadores para ${newPlayerData.name}`);
        visibleToNewPlayer.forEach(pData => socket.emit('player:new', pData));
    }
}

function updatePlayerPosition(socket) {
    const movedPlayerData = onlinePlayers.get(socket.id);
    if (movedPlayerData) {
        movedPlayerData.position = socket.data.characterPosition;
    }
    return movedPlayerData;
}

function handleVisibilityChanges(movedPlayerData, oldPos) {
    const newPos = movedPlayerData.position;
    const movedPlayerPublicData = getPlayerData(movedPlayerData);

    onlinePlayers.forEach((otherPlayerData, otherSocketId) => {
        if (otherSocketId === movedPlayerData.socket.id) return;

        const otherPlayerPublicData = getPlayerData(otherPlayerData);
        const wasVisible = isWithinRange(oldPos, otherPlayerData.position);
        const isVisible = isWithinRange(newPos, otherPlayerData.position);

        if (!wasVisible && isVisible) {
            console.log(`[VisibilityHandler] ${otherPlayerData.name} entrou na visão de ${movedPlayerData.name}`);
            movedPlayerData.socket.emit('player:new', otherPlayerPublicData);
            otherPlayerData.socket.emit('player:new', movedPlayerPublicData);
        } else if (wasVisible && !isVisible) {
            console.log(`[VisibilityHandler] ${otherPlayerData.name} saiu da visão de ${movedPlayerData.name}`);
            movedPlayerData.socket.emit('player:quit', { characterId: otherPlayerData.characterId });
            otherPlayerData.socket.emit('player:quit', { characterId: movedPlayerData.characterId });
        } else if (isVisible) {
            otherPlayerData.socket.emit('player:moved', {
                characterId: movedPlayerData.characterId,
                x: newPos.x,
                y: newPos.y,
            });
        }
    });
}

function removePlayer(socketId) {
    const disconnectedPlayerData = onlinePlayers.get(socketId);
    if (disconnectedPlayerData) {
        onlinePlayers.delete(socketId);
        console.log(`[VisibilityHandler] Jogador ${disconnectedPlayerData.name} (${socketId}) removido.`);
    }
    return disconnectedPlayerData;
}

function notifyPlayersOfDisconnect(disconnectedPlayerData) {
    if (!disconnectedPlayerData) return;

    const disconnectedPlayerId = disconnectedPlayerData.characterId;
    onlinePlayers.forEach((otherPlayerData) => {
        if (isWithinRange(disconnectedPlayerData.position, otherPlayerData.position)) {
            console.log(`[VisibilityHandler] Notificando ${otherPlayerData.name} sobre a saída de ${disconnectedPlayerData.name}`);
            otherPlayerData.socket.emit('player:quit', { characterId: disconnectedPlayerId });
        }
    });
}

export function initializeVisibilityHandler(io) {
    ioInstance = io;
    console.log('[VisibilityHandler] Inicializado.');
}

export function handlePlayerJoin(socket) {
    if (!ioInstance) return;

    const newPlayerData = addPlayer(socket);
    if (newPlayerData) {
        notifyPlayersOfNewJoin(newPlayerData, socket);
    }
}

export function handlePlayerMove(socket, oldPos) {
    if (!ioInstance || !onlinePlayers.has(socket.id)) return;

    const movedPlayerData = updatePlayerPosition(socket);
    if (movedPlayerData) {
        handleVisibilityChanges(movedPlayerData, oldPos);
    }
}

export function handlePlayerDisconnect(socketId) {
    if (!ioInstance) return;

    const disconnectedPlayerData = removePlayer(socketId);
    if (disconnectedPlayerData) {
        notifyPlayersOfDisconnect(disconnectedPlayerData);
    }
}
