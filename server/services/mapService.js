// --- NOVAS CONSTANTES DO MUNDO ---
const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;

// O ID do tile no array de dados do mapa
const TILE_GRASS = 0;
const TILE_VOID = -1; // O Phaser interpreta -1 como "sem tile" (preto)

// --- CONSTANTES DO BURACO ---
const HOLE_X_START = 25;
const HOLE_Y_START = 25;
const HOLE_WIDTH = 50;
const HOLE_HEIGHT = 50;
const HOLE_X_END = HOLE_X_START + HOLE_WIDTH;
const HOLE_Y_END = HOLE_Y_START + HOLE_HEIGHT;


let mapData = [];

/**
 * Gera o nosso mapa inicial de 100x100 com um buraco.
 */
function generateMap() {
    console.log(`[MapService] A gerar mapa ${MAP_WIDTH}x${MAP_HEIGHT}...`);
    mapData = []; 
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (x >= HOLE_X_START && x < HOLE_X_END && 
                y >= HOLE_Y_START && y < HOLE_Y_END) 
            {
                row.push(TILE_VOID);
            } else {
                row.push(TILE_GRASS);
            }
        }
        mapData.push(row);
    }
    console.log(`[MapService] Mapa gerado com buraco de ${HOLE_WIDTH}x${HOLE_HEIGHT} no centro.`);
}

/**
 * Retorna os dados completos do mapa.
 * @returns {number[][]} O array 2D do mapa.
 */
function getMap() {
    if (mapData.length === 0) {
        generateMap();
    }
    return mapData;
}

/**
 * Verifica se uma determinada coordenada (em tiles) é válida para andar.
 * @param {number} x A coordenada X do tile.
 * @param {number} y A coordenada Y do tile.
 * @returns {boolean} Verdadeiro se a posição for válida.
 */
function isValidPosition(x, y) {
    // --- (NOVA) VERIFICAÇÃO DE TIPO ---
    // Garante que x e y são números antes de prosseguir
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        console.warn(`[MapService] isValidPosition chamada com coordenadas inválidas: x=${x}, y=${y}`);
        return false;
    }
    // --- FIM DA VERIFICAÇÃO ---

    // 1. Verifica os limites do mapa
    if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) {
        return false;
    }
    
    // Garante que mapData foi inicializado (embora getMap deva tratar disso)
    if (mapData.length === 0 || !mapData[y]) {
         console.error(`[MapService] Tentativa de aceder a mapData[${y}] que é inválido.`);
         return false; // Linha y não existe?
    }

    // 2. Verifica o tipo de tile
    const tile = mapData[y][x]; // Acesso seguro agora
    
    // Só é válido se for GRAMA (0)
    return tile === TILE_GRASS;
}

// Exporta as funções como um objeto de serviço
export const mapService = {
    getMap,
    isValidPosition,
    MAP_WIDTH,
    MAP_HEIGHT,
    TILE_SIZE: 32 
};