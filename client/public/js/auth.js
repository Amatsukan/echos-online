const accountInfoString = sessionStorage.getItem('accountInfo');
const selectedCharacterString = sessionStorage.getItem('selectedCharacter');

let accountInfo; 
let selectedCharacter; 

if (!accountInfoString || !selectedCharacterString) {
    console.error("Não foi possível encontrar accountInfo ou selectedCharacter na sessão.");
    window.location.href = 'character-select.html';
} else {
    try {
        accountInfo = JSON.parse(accountInfoString); 
        selectedCharacter = JSON.parse(selectedCharacterString);
        console.log(`Entrando no mundo como ${selectedCharacter.name} (Conta: ${accountInfo.username})`);
    } catch (e) {
        console.error("Erro ao fazer parse dos dados da sessão:", e);
        window.location.href = 'login.html';
    }
}