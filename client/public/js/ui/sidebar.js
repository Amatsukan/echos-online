function setupSidebar(socket) {
    const hpBarFill = document.getElementById('hp-bar-fill');
    const mpBarFill = document.getElementById('mp-bar-fill');
    const backpackContainer = document.getElementById('backpack-container');
    const btnAtributos = document.getElementById('btn-atributos');

    const equipSlots = {
        '8': document.getElementById('equip-slot-8'), '1': document.getElementById('equip-slot-1'),
        '5': document.getElementById('equip-slot-5'), '9': document.getElementById('equip-slot-9'),
        '2': document.getElementById('equip-slot-2'), '6': document.getElementById('equip-slot-6'),
        '0': document.getElementById('equip-slot-0'), '3': document.getElementById('equip-slot-3'),
        '7': document.getElementById('equip-slot-7'), 
        '4': document.getElementById('equip-slot-4')
    };

    socket.on('player:updateStats', (stats) => {
        console.log('Recebidos Stats:', stats);
        if (hpBarFill && stats && typeof stats.hp === 'number' && typeof stats.maxHp === 'number' && stats.maxHp > 0) {
            const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
            hpBarFill.style.width = `${hpPercent}%`;
        }
        if (mpBarFill && stats && typeof stats.mp === 'number' && typeof stats.maxMp === 'number' && stats.maxMp > 0) {
            const mpPercent = Math.max(0, Math.min(100, (stats.mp / stats.maxMp) * 100));
            mpBarFill.style.width = `${mpPercent}%`;
        }
    });

    socket.on('player:updateEquipment', (equipment) => {
         console.log('Recebidos Equipamentos:', equipment);
         if (equipment) {
            for (const slotContent of Object.values(equipSlots)) {
                if (slotContent) { slotContent.innerText = ''; }
            }
            for (const [slotId, itemName] of Object.entries(equipment)) {
                const slotElement = equipSlots[slotId];
                if (slotElement) { 
                    slotElement.innerText = itemName || '';
                }
            }
         }
    });

    socket.on('player:updateInventory', (inventory) => {
        console.log('Recebido Inventário:', inventory);
        if (backpackContainer && Array.isArray(inventory)) {
            backpackContainer.innerHTML = '';
            for(let i = 0; i < 12; i++) { 
                const item = inventory[i];
                const slot = document.createElement('div');
                slot.className = 'backpack-slot';
                const content = document.createElement('div');
                content.className = 'backpack-slot-content';
                if (item && item.name && typeof item.quantity === 'number') { 
                    content.innerText = `${item.name}\n(x${item.quantity})`;
                } else {
                    content.innerText = '';
                }
                slot.appendChild(content);
                backpackContainer.appendChild(slot);
            }
        } else {
             console.warn("Recebido inventário inválido ou elemento backpackContainer não encontrado.");
        }
    });
    
    if (btnAtributos) {
        btnAtributos.addEventListener('click', () => {
            console.log('Pedindo atributos ao servidor...');
            socket.emit('player:getAttributes');
        });
    } else {
        console.warn('O elemento "btn-atributos" não foi encontrado no HTML.');
    }
    
    socket.on('player:showAttributes', (stats) => {
        if (stats && typeof stats.str === 'number') {
            const message = `--- Atributos Base ---

` + 
                          `Força (str): ${stats.str}
` + 
                          `Inteligência (int): ${stats.int}
` + 
                          `Destreza (dex): ${stats.dex}
` + 
                          `Constituição (con): ${stats.con}`;
            alert(message);
        } else {
            alert('Não foi possível buscar os atributos ou os dados são inválidos.');
        }
    });
}