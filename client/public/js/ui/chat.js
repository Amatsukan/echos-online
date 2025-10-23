function setupChat(socket) {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send-button');
    const chatTabLocal = document.getElementById('chat-tab-local');
    const chatTabGlobal = document.getElementById('chat-tab-global');
    const chatLabel = document.getElementById('chat-label');

    let currentChatChannel = 'local'; // Padrão é 'local'

    // Função para adicionar uma mensagem ao painel
    function addChatMessage(data) {
        // Verifica se os dados recebidos são válidos
        if (!data || !data.senderName || !data.message || !data.channel) {
            console.warn("Recebida mensagem de chat inválida:", data);
            return;
        }

        const { senderName, message, channel } = data;
        const p = document.createElement('p');
        
        if (channel === 'global') {
            p.className = 'global-chat';
            p.innerHTML = `[Global] <strong>${senderName}:</strong> ${message}`;
        } else {
            p.innerHTML = `<strong>${senderName}:</strong> ${message}`;
        }
        
        // Verifica se chatMessages existe antes de adicionar
        if(chatMessages) {
            chatMessages.appendChild(p);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Função para enviar a mensagem
    function sendChatMessage() {
        if(!chatInput) return; // Verifica se o input existe

        const message = chatInput.value.trim();
        if (message.length > 0) {
            socket.emit('chat:send', { 
                message: message,
                channel: currentChatChannel 
            });
            chatInput.value = '';
        }
    }

    function addNotificationMessage(data) {
        if (!data || !data.message || !data.type || !chatMessages) return;
        const { message, type } = data;
        const p = document.createElement('p');
        // Adiciona classe CSS com base no tipo
        p.className = `notification-${type}`; // Ex: 'notification-system'
        p.textContent = `*** ${message} ***`; // Formato diferente
        chatMessages.appendChild(p);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 1. Ouve as mensagens recebidas do servidor
    socket.on('chat:receive', (data) => {
        addChatMessage(data);
    });

    socket.on('notification:global', (data) => {
        console.log('Notificação Global Recebida:', data);
        addNotificationMessage(data); // Chama a função para exibir a notificação
    });

    socket.on('notification:private', (data) => {
        console.log('Notificação Privada Recebida:', data);
        addNotificationMessage(data); // Reutiliza a mesma função de display
    });

    // 2. Envia ao clicar no botão "send" (Verifica se o botão existe)
    if (chatSendButton) {
        chatSendButton.addEventListener('click', sendChatMessage);
    }

    // 3. Envia ao pressionar "Enter" no input (Verifica se o input existe)
    if (chatInput) {
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                sendChatMessage();
            }
        });
    }

    // 4. Lógica de troca de Abas (Verifica se as abas existem)
    if (chatTabLocal && chatTabGlobal && chatLabel) {
        chatTabLocal.addEventListener('click', () => {
            currentChatChannel = 'local';
            chatTabLocal.classList.add('active');
            chatTabGlobal.classList.remove('active');
            chatLabel.textContent = 'Local:';
        });

        chatTabGlobal.addEventListener('click', () => {
            currentChatChannel = 'global';
            chatTabGlobal.classList.add('active');
            chatTabLocal.classList.remove('active');
            chatLabel.textContent = 'Global:';
        });
    }
}