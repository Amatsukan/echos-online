
import { DataTypes } from 'sequelize';
import { sequelize } from '../../database/database.js';
import bcrypt from 'bcrypt';

// Este é o seu modelo "account", anteriormente chamado "User"
export const Account = sequelize.define('Account', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    passwordHash: { // Armazena a senha criptografada
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

// Hook para criptografar a senha automaticamente antes de criar a conta
Account.beforeCreate(async (account) => {
    const salt = await bcrypt.genSalt(10);
    account.passwordHash = await bcrypt.hash(account.passwordHash, salt);
});

// Método para verificar a senha no login
Account.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
};
