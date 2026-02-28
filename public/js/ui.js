class UI {
    constructor(game) {
        this.game = game;
        this.setupCrafting();
        this.setupChat();
    }
    
    setupCrafting() {
        const craftItems = document.querySelectorAll('.craft-item');
        craftItems.forEach(item => {
            item.addEventListener('click', () => {
                const itemType = item.dataset.item;
                this.game.craft(itemType);
                document.getElementById('craftingMenu').classList.add('hidden');
            });
        });
    }
    
    setupChat() {
        const chatInput = document.getElementById('chatInput');
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (document.activeElement === chatInput) {
                    const msg = chatInput.value.trim();
                    if (msg) {
                        this.addChatMessage(this.game.player?.name || 'Player', msg);
                        chatInput.value = '';
                    }
                    chatInput.blur();
                } else {
                    chatInput.focus();
                }
            }
        });
    }
    
    updateResources() {
        if (!this.game.player) return;
        
        const inv = this.game.player.inventory;
        document.getElementById('woodCount').textContent = inv.wood || 0;
        document.getElementById('stoneCount').textContent = inv.stone || 0;
        document.getElementById('foodCount').textContent = inv.food || 0;
        document.getElementById('goldCount').textContent = inv.gold || 0;
    }
    
    updateHealth() {
        if (!this.game.player) return;
        
        const health = this.game.player.health;
        const maxHealth = this.game.player.maxHealth;
        const percent = (health / maxHealth) * 100;
        
        document.getElementById('healthFill').style.width = percent + '%';
        document.getElementById('healthText').textContent = `${Math.ceil(health)}/${maxHealth}`;
    }
    
    updateAge() {
        if (!this.game.player) return;
        
        document.getElementById('ageNum').textContent = this.game.player.age;
        
        const xpPercent = (this.game.player.xp % 100);
        document.getElementById('xpFill').style.width = xpPercent + '%';
    }
    
    updateLeaderboard() {
        const list = document.getElementById('leaderboardList');
        list.innerHTML = '';
        
        const sorted = Object.values(this.game.players)
            .filter(p => !p.dead)
            .sort((a, b) => {
                const scoreA = (a.inventory?.gold || 0) * 100 + 
                              (a.inventory?.wood || 0) + 
                              (a.inventory?.stone || 0);
                const scoreB = (b.inventory?.gold || 0) * 100 + 
                              (b.inventory?.wood || 0) + 
                              (b.inventory?.stone || 0);
                return scoreB - scoreA;
            })
            .slice(0, 5);
        
        sorted.forEach((player, index) => {
            const div = document.createElement('div');
            div.className = 'leaderboard-item';
            
            const score = (player.inventory?.gold || 0) * 100 + 
                         (player.inventory?.wood || 0) + 
                         (player.inventory?.stone || 0);
            
            div.innerHTML = `
                <span>${index + 1}. ${player.name}</span>
                <span>${score}</span>
            `;
            list.appendChild(div);
        });
    }
    
    addChatMessage(name, message) {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = 'chat-message';
        div.innerHTML = `<span class=\"name\">${name}:</span> ${message}`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
    
    showDeathScreen() {
        document.getElementById('deathScreen').classList.remove('hidden');
        
        let timeLeft = 5;
        const timer = document.getElementById('respawnTimer');
        timer.textContent = timeLeft;
        
        const interval = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                document.getElementById('deathScreen').classList.add('hidden');
            }
        }, 1000);
    }
    
    shakeScreen() {
        const canvas = this.game.canvas;
        canvas.style.transform = 'translate(5px, 5px)';
        setTimeout(() => {
            canvas.style.transform = 'translate(-5px, -5px)';
            setTimeout(() => {
                canvas.style.transform = 'translate(5px, -5px)';
                setTimeout(() => {
                    canvas.style.transform = 'translate(0, 0)';
                }, 50);
            }, 50);
        }, 50);
    }
    
    update() {
        this.updateResources();
        this.updateHealth();
        this.updateAge();
        this.updateLeaderboard();
    }
}

setInterval(() => {
    if (window.game && window.game.ui) {
        window.game.ui.update();
    }
}, 1000);