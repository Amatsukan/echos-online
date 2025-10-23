function startGame(socket) {
    let TILE_SIZE = 32;

    const MOVEMENT_COOLDOWN_MS = 250;
    const SPEECH_BUBBLE_DURATION = 5000;

    const gameContext = {
        player: null,
        otherPlayers: new Map(),
        map: null,
        tileSize: 32,
        isMoving: false,
        movementTask: null,
        speechBubbles: new Map()
    };

    const config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.RESIZE,
            parent: 'game-container',
            width: '100%',
            height: '100%'
        },
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 }
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);

    function preload() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x228B22, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.lineStyle(1, 0x006400, 0.5);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.generateTexture('tile_grass', 32, 32);

        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0x0000ff, 1);
        playerGraphics.fillRect(8, 8, 16, 16);
        playerGraphics.generateTexture('player_sprite', 32, 32);

        const otherPlayerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        otherPlayerGraphics.fillStyle(0xff0000, 1);
        otherPlayerGraphics.fillRect(8, 8, 16, 16);
        otherPlayerGraphics.generateTexture('other_player_sprite', 32, 32);

        graphics.destroy();
        playerGraphics.destroy();
        otherPlayerGraphics.destroy();
    }

    function create() {
        gameContext.scene = this;
        gameContext.isMoving = false;

        socket.on('map:load', (data) => {
            console.log('Recebendo mapa do servidor...');
            gameContext.tileSize = data.tileSize;
            TILE_SIZE = data.tileSize;

            const map = this.make.tilemap({ data: data.mapData, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
            const tileset = map.addTilesetImage('tile_grass', 'tile_grass');

            if (!tileset) {
                console.error("### ERRO CRÍTICO: Falha ao adicionar o tileset 'tile_grass'. Verifica se o nome da textura ('tile_grass') no preload() está correto e se a textura foi gerada sem erros! ###");
                return;
            }
            console.log("Tileset 'tile_grass' adicionado com sucesso.");

            const layer = map.createLayer(0, tileset, 0, 0);

            if (!layer) {
                console.error("### ERRO CRÍTICO: Falha ao criar a camada do mapa (createLayer falhou). Isto geralmente acontece se o tileset ('tile_grass') não foi carregado corretamente. Verifica os logs acima. ###");
                return;
            }
            console.log("Camada do mapa criada com sucesso.");

            gameContext.map = map;

            this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
            this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        });

        socket.on('player:spawn', (data) => {
            console.log('Dados recebidos para player:spawn:', data);
            if (typeof data.x === 'undefined' || typeof data.y === 'undefined' || data.x === null || data.y === null) {
                console.error("### ERRO: Dados de spawn inválidos recebidos do servidor! x ou y estão undefined ou null. ###", data);
                return;
            }

            console.log(`Spawning em ${data.x}, ${data.y}`);
            const spawnX = (data.x * TILE_SIZE) + (TILE_SIZE / 2);
            const spawnY = (data.y * TILE_SIZE) + (TILE_SIZE / 2);
            const player = this.physics.add.sprite(spawnX, spawnY, 'player_sprite');
            player.setCollideWorldBounds(true);
            this.cameras.main.startFollow(player);
            gameContext.player = player;
        });

        socket.on('player:move:success', (data) => {
            if (!gameContext.player) return;
            const newX = (data.x * TILE_SIZE) + (TILE_SIZE / 2);
            const newY = (data.y * TILE_SIZE) + (TILE_SIZE / 2);
            gameContext.player.setPosition(newX, newY);
        });

        socket.on('player:move:fail', (data) => {
            console.warn(`Movimento falhou para ${data.x}, ${data.y}. Obstáculo.`);
            gameContext.movementTask = null;
        });

        socket.on('player:new', (data) => {
            console.log('Dados recebidos para player:new:', data);
            if (typeof data.x === 'undefined' || typeof data.y === 'undefined' || data.x === null || data.y === null) {
                console.error("### ERRO: Dados inválidos recebidos para player:new! x ou y estão undefined ou null. ###", data);
                return;
            }
            console.log(`Novo jogador entrou: ${data.characterId} em ${data.x}, ${data.y}`);
            const spawnX = (data.x * TILE_SIZE) + (TILE_SIZE / 2);
            const spawnY = (data.y * TILE_SIZE) + (TILE_SIZE / 2);
            const otherPlayer = this.add.sprite(spawnX, spawnY, 'other_player_sprite');
            gameContext.otherPlayers.set(data.characterId, otherPlayer);
        });

        socket.on('player:moved', (data) => {
            const playerToMove = gameContext.otherPlayers.get(data.characterId);
            if (playerToMove) {
                if (typeof data.x === 'number' && typeof data.y === 'number') {
                    const newX = (data.x * TILE_SIZE) + (TILE_SIZE / 2);
                    const newY = (data.y * TILE_SIZE) + (TILE_SIZE / 2);
                    playerToMove.setPosition(newX, newY);
                } else {
                    console.warn('Dados inválidos recebidos para player:moved', data);
                }
            }
        });

        socket.on('player:quit', (data) => {
            console.log(`Jogador saiu: ${data.characterId}`);
            destroySpeechBubble(data.characterId);
            const playerToDestroy = gameContext.otherPlayers.get(data.characterId);
            if (playerToDestroy) {
                playerToDestroy.destroy();
                gameContext.otherPlayers.delete(data.characterId);
            }
        });

        socket.on('player:spoke', (data) => {
            createSpeechBubble(data.characterId, data.message);
        });

        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.input.on('pointerdown', (pointer) => {
            if (pointer.button !== 0) return;
            const worldPoint = pointer.positionToCamera(this.cameras.main);
            const targetTileX = Math.floor(worldPoint.x / TILE_SIZE);
            const targetTileY = Math.floor(worldPoint.y / TILE_SIZE);
            console.log(`Nova tarefa de movimento: ir para [${targetTileX}, ${targetTileY}]`);
            gameContext.movementTask = { x: targetTileX, y: targetTileY };
        });

        const chatInput = document.getElementById('chat-input');
        let isChatFocused = false;
        chatInput.addEventListener('focus', () => {
            console.log('Chat Focado - Teclado Phaser desativado');
            isChatFocused = true;
            this.input.keyboard.disableGlobalCapture();
        });

        chatInput.addEventListener('blur', () => {
            console.log('Chat Perdeu Foco - Teclado Phaser ativado');
            isChatFocused = false;
            this.input.keyboard.enableGlobalCapture();
        });

        this.input.keyboard.on('keydown-SPACE', (event) => {
            if (!isChatFocused) {
                event.preventDefault();
                chatInput.focus();
            }
        });
    }

    function getPlayerSprite(characterId) {
        const selectedCharacterString = sessionStorage.getItem('selectedCharacter');
        const selectedCharacter = JSON.parse(selectedCharacterString);
        if (selectedCharacter && selectedCharacter.id === characterId) {
            return gameContext.player;
        }
        return gameContext.otherPlayers.get(characterId);
    }

    function destroySpeechBubble(characterId) {
        if (gameContext.speechBubbles.has(characterId)) {
            gameContext.speechBubbles.get(characterId).destroy();
            gameContext.speechBubbles.delete(characterId);
        }
    }

    function createSpeechBubble(characterId, message) {
        destroySpeechBubble(characterId);
        const playerSprite = getPlayerSprite(characterId);
        if (!playerSprite) return;
        const text = gameContext.scene.add.text(
            playerSprite.x,
            playerSprite.y - TILE_SIZE,
            message,
            {
                fontFamily: 'sans-serif', fontSize: '12px', color: '#000000',
                backgroundColor: '#ffffff', padding: { x: 5, y: 3 },
                wordWrap: { width: 150 }
            }
        );
        text.setOrigin(0.5, 1);
        gameContext.speechBubbles.set(characterId, text);
        gameContext.scene.time.delayedCall(SPEECH_BUBBLE_DURATION, () => {
            destroySpeechBubble(characterId);
        });
    }

    function update() {
        if (!gameContext.player || !socket || gameContext.isMoving) {
            return;
        }
        const currentTileX = Math.floor(gameContext.player.x / TILE_SIZE);
        const currentTileY = Math.floor(gameContext.player.y / TILE_SIZE);
        let targetX = currentTileX;
        let targetY = currentTileY;
        let moveAttempted = false;
        if (Phaser.Input.Keyboard.JustDown(this.wasd.W)) {
            gameContext.movementTask = null;
            targetY = currentTileY - 1;
            moveAttempted = true;
        } else if (Phaser.Input.Keyboard.JustDown(this.wasd.S)) {
            gameContext.movementTask = null;
            targetY = currentTileY + 1;
            moveAttempted = true;
        } else if (Phaser.Input.Keyboard.JustDown(this.wasd.A)) {
            gameContext.movementTask = null;
            targetX = currentTileX - 1;
            moveAttempted = true;
        } else if (Phaser.Input.Keyboard.JustDown(this.wasd.D)) {
            gameContext.movementTask = null;
            targetX = currentTileX + 1;
            moveAttempted = true;
        }
        else if (gameContext.movementTask) {
            const taskTargetX = gameContext.movementTask.x;
            const taskTargetY = gameContext.movementTask.y;
            if (currentTileX === taskTargetX && currentTileY === taskTargetY) {
                gameContext.movementTask = null;
            } else {
                if (currentTileX < taskTargetX) targetX++;
                else if (currentTileX > taskTargetX) targetX--;
                else if (currentTileY < taskTargetY) targetY++;
                else if (currentTileY > taskTargetY) targetY--;
                moveAttempted = true;
            }
        }
        if (moveAttempted) {
            gameContext.isMoving = true;
            setTimeout(() => {
                gameContext.isMoving = false;
            }, MOVEMENT_COOLDOWN_MS);
            socket.emit('player:move:attempt', { x: targetX, y: targetY });
        }
        gameContext.speechBubbles.forEach((bubble, characterId) => {
            const playerSprite = getPlayerSprite(characterId);
            if (playerSprite) {
                bubble.setPosition(playerSprite.x, playerSprite.y - TILE_SIZE);
            }
        });
    }
}
