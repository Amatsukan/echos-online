document.addEventListener('DOMContentLoaded', () => {
    // Verifica se a informação da conta existe, senão redireciona
    const accountInfoString = sessionStorage.getItem('accountInfo');
    if (!accountInfoString) {
        window.location.href = '/login.html';
        return; // Impede a execução do resto do script
    }

    let accountInfo;
    try {
        accountInfo = JSON.parse(accountInfoString);
    } catch (e) {
        console.error("Erro ao fazer parse do accountInfo:", e);
        sessionStorage.removeItem('accountInfo'); // Limpa dados inválidos
        window.location.href = '/login.html';
        return;
    }

    // Elementos do DOM
    const welcomeTitle = document.getElementById('welcome-title');
    const slotsContainer = document.getElementById('character-slots-container');

    // Personaliza o título
    if (welcomeTitle && accountInfo.username) {
        welcomeTitle.textContent = `Bem-vindo(a), ${accountInfo.username}!`;
    }

    // Função para gerar um slot de personagem
    function createCharacterSlot(char) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        // Guarda os dados completos no dataset para fácil acesso
        slot.dataset.charInfo = JSON.stringify(char); 

        const img = document.createElement('img');
        // Usando inicial do nome para placeholder
        img.src = `https://placehold.co/100x100/555/FFF?text=${char.name.charAt(0).toUpperCase()}`; 
        img.alt = `Avatar de ${char.name}`;
        
        const nameH2 = document.createElement('h2');
        nameH2.textContent = char.name;

        const classLevelP = document.createElement('p');
        classLevelP.className = 'class-level';
        classLevelP.textContent = `${char.class || 'Sem Classe'} - Nível ${char.level || 1}`;

        slot.appendChild(img);
        slot.appendChild(nameH2);
        slot.appendChild(classLevelP);

        // Adiciona o evento de clique para entrar no jogo
        slot.addEventListener('click', function() {
            const selectedChar = JSON.parse(this.dataset.charInfo);
            // Guarda apenas o personagem selecionado antes de ir para o jogo
            sessionStorage.setItem('selectedCharacter', JSON.stringify(selectedChar));
            window.location.href = '/index.html'; // Redireciona para o jogo
        });

        return slot;
    }

    // Função para gerar o slot de "Criar Novo"
    function createNewCharacterSlot() {
        const slot = document.createElement('div');
        slot.className = 'slot new-char'; // Adiciona classe 'new-char'

        const plusH2 = document.createElement('h2');
        plusH2.className = 'plus-sign'; // Classe para estilizar o '+'
        plusH2.textContent = '+';

        const createP = document.createElement('p');
        createP.textContent = 'Criar Novo';

        slot.appendChild(plusH2);
        slot.appendChild(createP);

        // Adiciona o evento de clique para ir para a criação
        slot.addEventListener('click', function() {
            window.location.href = '/character-create.html';
        });

        return slot;
    }
    
    // Gera os slots dinamicamente
    if (slotsContainer) {
        slotsContainer.innerHTML = ''; // Limpa o container

        // Adiciona slots para personagens existentes
        if (accountInfo.characters && accountInfo.characters.length > 0) {
            accountInfo.characters.forEach(char => {
                slotsContainer.appendChild(createCharacterSlot(char));
            });
        } else {
             console.log("Nenhum personagem encontrado para esta conta.");
             // Poderia adicionar uma mensagem aqui se quisesse
        }

        // Adiciona o slot "Criar Novo" (pode ser condicional ao número de chars)
        // Ex: if (accountInfo.characters.length < 3) { ... }
        slotsContainer.appendChild(createNewCharacterSlot());

    } else {
         console.error("Container 'character-slots-container' não encontrado.");
    }

     // Lógica para o link de logoff (se adicionado)
     const logoffLink = document.getElementById('logoff-link');
     if (logoffLink) {
         logoffLink.addEventListener('click', (event) => {
             event.preventDefault(); // Impede a navegação padrão do link
             sessionStorage.removeItem('accountInfo');
             sessionStorage.removeItem('selectedCharacter'); // Limpa ambos
             window.location.href = '/login.html'; // Redireciona para login
         });
     }

}); // Fim do DOMContentLoaded