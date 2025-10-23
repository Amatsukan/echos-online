document.addEventListener('DOMContentLoaded', () => {
    // Verifica se a informação da conta existe, senão redireciona
    const accountInfoString = sessionStorage.getItem('accountInfo');
    let accountInfo;
    if (!accountInfoString) {
        window.location.href = '/login.html';
        return; // Impede a execução do resto do script se não houver dados
    } else {
        try {
            accountInfo = JSON.parse(accountInfoString);
        } catch(e) {
             console.error("Erro ao fazer parse do accountInfo:", e);
             window.location.href = '/login.html'; // Redireciona em caso de erro
             return;
        }
    }

    // Elementos do DOM
    const createForm = document.getElementById('create-form');
    const nameInput = document.getElementById('name');
    const classSelect = document.getElementById('class-select');
    const createButton = document.getElementById('create-button');
    const errorMessage = document.getElementById('error-message');

    // Conexão Socket.IO
    const socket = io('http://localhost:3000'); // Certifica-te que o URL está correto

    // --- Eventos do Socket ---

    socket.on('connect', () => {
        console.log('Conectado ao servidor!');

        // Autentica este socket
        if (accountInfo && accountInfo.accountId) {
            console.log(`Autenticando socket com accountId: ${accountInfo.accountId}`);
            socket.emit('client:authenticate', { accountId: accountInfo.accountId });
        } else {
            console.error('Não foi possível encontrar accountId no sessionStorage para autenticar.');
            // (Opcional: Redirecionar para login?)
        }

        // Pede a lista de classes
        socket.emit('character:getClasses');
    });

    socket.on('disconnect', () => {
        console.warn('Desconectado do servidor!');
        errorMessage.textContent = 'Desconectado do servidor.';
        errorMessage.style.color = '#ffc107'; // Amarelo
    });

    // Recebe a lista de classes
    socket.on('character:classList', (classes) => {
        classSelect.innerHTML = ''; // Limpa o "A carregar..."
        if (classes && classes.length > 0) {
            // Adiciona uma opção padrão "Selecione"
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Selecione uma Classe';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            classSelect.appendChild(defaultOption);

            // Adiciona as classes recebidas
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                classSelect.appendChild(option);
            });
        } else {
            classSelect.innerHTML = '<option value="">Nenhuma classe disponível</option>';
            createButton.disabled = true; // Desabilita o botão se não houver classes
        }
    });

    // Ouve a falha na criação
    socket.on('character:createFail', (data) => {
        errorMessage.textContent = data.message || 'Erro desconhecido ao criar personagem.';
        errorMessage.style.color = '#ff4d4d'; // Vermelho
        createButton.disabled = false; // Reabilita o botão
    });

    // Ouve o SUCESSO na criação (e a lista de personagens atualizada)
    socket.on('account:updateCharacters', (data) => {
        console.log('Lista de personagens atualizada recebida.');
        // Atualiza o sessionStorage com os dados mais recentes
        sessionStorage.setItem('accountInfo', JSON.stringify(data));
        
        // Redireciona de volta para a seleção de personagem
        window.location.href = 'character-select.html';
    });

    // --- Evento do Formulário ---
    if (createForm) {
        createForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const name = nameInput.value.trim();
            const classId = classSelect.value;

            // Validação simples do lado do cliente
            if (!name) {
                 errorMessage.textContent = 'Por favor, insira um nome.';
                 return;
            }
             if (!classId) {
                errorMessage.textContent = 'Por favor, selecione uma classe.';
                return;
            }

            // Desabilita o botão e mostra feedback
            createButton.disabled = true;
            errorMessage.textContent = 'A criar...';
            errorMessage.style.color = '#ccc'; // Cinza claro

            // Envia os dados para o servidor
            socket.emit('character:createAttempt', {
                name: name,
                classId: parseInt(classId, 10) // Garante que é um número
            });
        });
    } else {
         console.error("Formulário 'create-form' não encontrado.");
    }
}); // Fim do DOMContentLoaded