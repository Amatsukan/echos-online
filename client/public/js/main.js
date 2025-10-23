document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000');

    const accountInfoString = sessionStorage.getItem('accountInfo');
    const selectedCharacterString = sessionStorage.getItem('selectedCharacter');
    let accountInfo;
    let selectedCharacter;

    if (accountInfoString && selectedCharacterString) {
        accountInfo = JSON.parse(accountInfoString);
        selectedCharacter = JSON.parse(selectedCharacterString);
    } else {
        // No need to do anything, auth.js should have already redirected.
        return;
    }

    socket.on('connect', () => {
        console.log('Conectado ao servidor do mundo!');
        if (accountInfo && accountInfo.accountId) {
            socket.emit('client:authenticate', { accountId: accountInfo.accountId });
        }
        if (selectedCharacter && selectedCharacter.id) {
            socket.emit('player:join', { characterId: selectedCharacter.id });
        }
    });

    socket.on('disconnect', () => {
        console.warn('Desconectado do servidor do mundo!');
    });

    const charSelectButton = document.getElementById('btn-char-select');
    if(charSelectButton) {
        charSelectButton.addEventListener('click', () => {
            window.location.href = '/character-select.html';
        });
    }

    const logoffButton = document.getElementById('btn-logoff');
    if(logoffButton) {
        logoffButton.addEventListener('click', () => {
            sessionStorage.removeItem('accountInfo');
            sessionStorage.removeItem('selectedCharacter');
            window.location.href = '/login.html';
        });
    }
    
    const skillsButton = document.getElementById('btn-skills');
    if(skillsButton) {
        skillsButton.addEventListener('click', () => {
            alert('Funcionalidade ainda não implementada!');
        });
    }

    const questsButton = document.getElementById('btn-quests');
    if(questsButton) {
        questsButton.addEventListener('click', () => {
            alert('Funcionalidade ainda não implementada!');
        });
    }

    setupChat(socket);
    setupSidebar(socket);
    startGame(socket);
});