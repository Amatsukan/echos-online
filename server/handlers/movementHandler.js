import { mapService } from '../services/mapService.js';
import { handlePlayerMove } from './visibilityHandler.js';

const MOVEMENT_COOLDOWN_MS = 250;

const isValidMovementRequest = (socket, targetTile) => {
    if (!targetTile || typeof targetTile.x !== 'number' || typeof targetTile.y !== 'number') {
        console.warn(`[MovementHandler] Recebido targetTile inválido de ${socket.id}:`, targetTile);
        return false;
    }

    if (!socket.data.characterId) {
        return false;
    }

    const now = Date.now();
    const lastMoveTime = socket.data.lastMoveTime || 0;

    if (now - lastMoveTime < MOVEMENT_COOLDOWN_MS) {
        return false;
    }

    return true;
};

const processSuccessfulMovement = (socket, targetX, targetY, oldPos) => {
    const newPos = { x: targetX, y: targetY };
    socket.data.characterPosition = newPos;
    socket.data.lastMoveTime = Date.now();

    socket.emit('player:move:success', newPos);
    handlePlayerMove(socket, oldPos);
};

const processFailedMovement = (socket, targetX, targetY) => {
    socket.emit('player:move:fail', { x: targetX, y: targetY });
};

const handleMovementAttempt = (socket, targetTile) => {
    console.log(`[MovementHandler] Recebido move:attempt de ${socket.id}:`, targetTile);

    if (!isValidMovementRequest(socket, targetTile)) {
        return;
    }

    const { x: targetX, y: targetY } = targetTile;
    const oldPos = { ...socket.data.characterPosition };

    if (!mapService.isValidPosition(targetX, targetY)) {
        processFailedMovement(socket, targetX, targetY);
        return;
    }

    processSuccessfulMovement(socket, targetX, targetY, oldPos);
};

export function registerMovementHandler(socket) {
    socket.on('player:move:attempt', (targetTile) => handleMovementAttempt(socket, targetTile));
}
