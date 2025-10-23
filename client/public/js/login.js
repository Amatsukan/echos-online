const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Conectado ao servidor de login!');
    errorMessage.textContent = 'Conectado. Pronto para o login.';
    errorMessage.style.color = '#28a745'; // Verde
});

socket.on('disconnect', () => {
    console.warn('Desconectado do servidor de login!');
    errorMessage.textContent = 'Desconectado. A tentar reconectar...';
    errorMessage.style.color = '#ffc107'; // Amarelo
});

socket.on('login:fail', (data) => {
    console.error('Falha no login:', data.message);
    errorMessage.textContent = data.message;
    errorMessage.style.color = '#ff4d4d'; // Vermelho
    loginButton.disabled = false;
});

socket.on('login:success', (data) => {
    console.log('Login bem-sucedido!', data);
    sessionStorage.setItem('accountInfo', JSON.stringify(data));
    window.location.href = 'character-select.html';
});

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    loginButton.disabled = true;
    errorMessage.textContent = 'A autenticar...';
    errorMessage.style.color = '#ccc';

    socket.emit('login:attempt', {
        username: username,
        password: password
    });
});