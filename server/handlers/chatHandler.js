import { chatSchema } from '../validators/chatSchema.js';

// Define o alcance (em tiles) do chat local.
// (15 tiles para cada lado, forma um quadrado de 30x30)
const LOCAL_CHAT_RANGE = 15;

/**
 * Regista os handlers de chat do jogador.
 * @param {Server} io A instância do servidor Socket.IO (para emitir para todos).
 * @param {Socket} socket O socket do cliente.
 */
export function registerChatHandler(io, socket) {

    // Ouve quando um cliente tenta enviar uma mensagem
    socket.on('chat:send', (data) => {
        
        // 1. Validar os dados da mensagem (data = { message: "...", channel: "local" })
        const { error, value } = chatSchema.validate(data);

        if (error) {
            console.warn(`[ChatHandler] Socket ${socket.id} enviou mensagem inválida: ${error.message}`);
            return;
        }

        // 2. Identificar o remetente
        const senderName = socket.data.characterDetails?.name;
        const senderPos = socket.data.characterPosition;
        const senderId = socket.data.characterId;

        if (!senderName || !senderPos || !senderId) {
            console.warn(`[ChatHandler] Socket ${socket.id} tentou enviar chat sem dados completos.`);
            return;
        }

        const { message, channel } = value;

        // 3. Preparar os pacotes de dados
        const messageData = {
            timestamp: Date.now(),
            senderName: senderName,
            message: message,
            channel: channel // 'local' ou 'global'
        };

        const bubbleData = {
            characterId: senderId,
            message: message
        };

        // 4. Lógica de Distribuição
        if (channel === 'global') {
            // --- CANAL GLOBAL ---
            // Envia para todos no servidor
            io.emit('chat:receive', messageData);
            io.emit('player:spoke', bubbleData);

            console.log(`[ChatHandler] [Global] [${senderName}]: ${message}`);

        } else {
            // --- CANAL LOCAL ---
            console.log(`[ChatHandler] [Local] [${senderName}]: ${message}`);

            // Itera por todos os sockets conectados
            io.sockets.sockets.forEach(otherSocket => {
                
                // Pega a posição do outro jogador
                const otherPos = otherSocket.data.characterPosition;
                
                if (otherPos) {
                    // Calcula a distância (Manhattan distance, mais simples para grids)
                    const distanceX = Math.abs(senderPos.x - otherPos.x);
                    const distanceY = Math.abs(senderPos.y - otherPos.y);

                    // Se estiver dentro do alcance...
                    if (distanceX <= LOCAL_CHAT_RANGE && distanceY <= LOCAL_CHAT_RANGE) {
                        // ...envia a mensagem (para a UI) e o balão (para o Phaser)
                        otherSocket.emit('chat:receive', messageData);
                        otherSocket.emit('player:spoke', bubbleData);
                    }
                }
            });
        }
    });
}