import { chatSchema } from '../validators/chatSchema.js';

const LOCAL_CHAT_RANGE = 15;

const validateChatMessage = (data) => {
    return chatSchema.validate(data);
};

const getSenderInfo = (socket) => {
    return {
        senderName: socket.data.characterDetails?.name,
        senderPos: socket.data.characterPosition,
        senderId: socket.data.characterId,
    };
};

const prepareMessagePayloads = (senderName, message, channel, senderId) => {
    return {
        messageData: {
            timestamp: Date.now(),
            senderName: senderName,
            message: message,
            channel: channel,
        },
        bubbleData: {
            characterId: senderId,
            message: message,
        },
    };
};

const distributeGlobalMessage = (io, messageData, bubbleData, senderName, message) => {
    io.emit('chat:receive', messageData);
    io.emit('player:spoke', bubbleData);
    console.log(`[ChatHandler] [Global] [${senderName}]: ${message}`);
};

const distributeLocalMessage = (io, messageData, bubbleData, senderPos, senderName, message) => {
    console.log(`[ChatHandler] [Local] [${senderName}]: ${message}`);
    io.sockets.sockets.forEach(otherSocket => {
        const otherPos = otherSocket.data.characterPosition;
        if (otherPos) {
            const distanceX = Math.abs(senderPos.x - otherPos.x);
            const distanceY = Math.abs(senderPos.y - otherPos.y);
            if (distanceX <= LOCAL_CHAT_RANGE && distanceY <= LOCAL_CHAT_RANGE) {
                otherSocket.emit('chat:receive', messageData);
                otherSocket.emit('player:spoke', bubbleData);
            }
        }
    });
};

const handleChatMessage = (io, socket, data) => {
    const { error, value } = validateChatMessage(data);
    if (error) {
        console.warn(`[ChatHandler] Socket ${socket.id} enviou mensagem inválida: ${error.message}`);
        return;
    }

    const { senderName, senderPos, senderId } = getSenderInfo(socket);
    if (!senderName || !senderPos || !senderId) {
        console.warn(`[ChatHandler] Socket ${socket.id} tentou enviar chat sem dados completos.`);
        return;
    }

    const { message, channel } = value;
    const { messageData, bubbleData } = prepareMessagePayloads(senderName, message, channel, senderId);

    if (channel === 'global') {
        distributeGlobalMessage(io, messageData, bubbleData, senderName, message);
    } else {
        distributeLocalMessage(io, messageData, bubbleData, senderPos, senderName, message);
    }
};

export function registerChatHandler(io, socket) {
    socket.on('chat:send', (data) => handleChatMessage(io, socket, data));
}
