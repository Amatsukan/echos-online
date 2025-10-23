import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Aponta para a pasta /server

const app = express();
const CLIENT_PORT = 8080;

const clientPath = path.join(__dirname, '.', 'public');
console.log(`[SERVIDOR DO CLIENTE] A servir ficheiros de: ${clientPath}`);
app.use(express.static(clientPath));

app.listen(CLIENT_PORT, () => {
    console.log(`[SERVIDOR DO CLIENTE] A servir ficheiros em http://localhost:${CLIENT_PORT}`);
});
