import { Account } from '../models/index.js';

/**
 * Regista o handler para "autenticar" sockets em novas conexões/páginas.
 * Isto é usado por clientes (index.html, character-create.html) que
 * se conectam *depois* do login e precisam de se identificar.
 * * @param {Socket} socket O socket do cliente.
 */
export function registerAuthenticationHandler(socket) {
    
    // Ouve o evento de autenticação enviado por qualquer cliente
    // que já tenha dados de conta no sessionStorage.
    socket.on('client:authenticate', async (data) => {
        if (data && data.accountId) {
            // Busca a conta no banco de dados para garantir que é válida
            // e para obter o username
            const account = await Account.findByPk(data.accountId);
            
            if (account) {
                // Armazena os dados da conta no socket
                socket.data.accountId = account.id;
                socket.data.username = account.username;
                console.log(`[AuthHandler] Socket ${socket.id} autenticado como ${account.username} (ID: ${account.id})`);
            } else {
                console.warn(`[AuthHandler] Tentativa de autenticação falhada para Socket ${socket.id}: Conta ${data.accountId} não encontrada.`);
            }
        } else {
            console.warn(`[AuthHandler] Tentativa de autenticação falhada para Socket ${socket.id}: accountId não foi fornecido.`);
        }
    });
}