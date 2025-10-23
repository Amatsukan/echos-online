const registerForm = document.getElementById('register-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const registerButton = document.getElementById('register-button');
const message = document.getElementById('message');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Conectado ao servidor!');
});

socket.on('register:fail', (data) => {
    console.error('Falha no registo:', data.message);
    message.textContent = data.message;
    message.className = 'message error-message';
    registerButton.disabled = false;
});

socket.on('register:success', (data) => {
    console.log('Registo bem-sucedido!', data);
    message.textContent = 'Conta criada com sucesso! A redirecionar...';
    message.className = 'message success-message';
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
});

registerForm.addEventListener('submit', function(event) {
    event.preventDefault(); 

    const username = usernameInput.value;
    const password = passwordInput.value;

    registerButton.disabled = true;
    message.textContent = 'A processar...';
    message.className = 'message';

    socket.emit('register:attempt', {
        username: username,
        password: password
    });
});