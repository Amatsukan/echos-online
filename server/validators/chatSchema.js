import Joi from 'joi';

// Define o modelo para uma mensagem de chat
export const chatSchema = Joi.object({
    message: Joi.string().min(1).max(255).required(),
    
    // (NOVO) Valida se o canal é 'local' ou 'global'
    channel: Joi.string().valid('local', 'global').required()
});