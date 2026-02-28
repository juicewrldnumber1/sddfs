class Input {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        
        this.setupKeyboard();
        this.setupMouse();
        this.setupToolbar();
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.game.keys[e.key.toLowerCase()] = true;
            
            if (e.key >= '1' && e.key <= '9') {
                this.selectSlot(parseInt(e.key) - 1);
            }
            
            if (e.key.toLowerCase() === 'c') {
                this.toggleCrafting();
            }
            
            if (e.key === ' ') {
                e.preventDefault();
                this.autoAttack();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.game.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupMouse() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.game.mouse.x = e.clientX - rect.left;
            this.game.mouse.y = e.clientY - rect.top;
            
            if (this.game.player) {
                const worldX = this.game.mouse.x + this.game.camera.x;
                const worldY = this.game.mouse.y + this.game.camera.y;
                this.game.player.angle = Math.atan2(
                    worldY - this.game.player.y,
                    worldX - this.game.player.x
                );
            }
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.game.mouse.down = true;
            this.handleClick(e);
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.game.mouse.down = false;
        });
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
    }
    
    setupToolbar() {
        const slots = document.querySelectorAll('.tool-slot');
        slots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectSlot(index);
            });
        });
    }
    
    selectSlot(index) {
        const slots = document.querySelectorAll('.tool-slot');
        if (index < 0 || index >= slots.length) return;
        
        slots.forEach(s => s.classList.remove('active'));
        slots[index].classList.add('active');
        
        const tool = slots[index].dataset.tool;
        this.game.selectedTool = tool;
        
        if (this.game.player) {
            this.game.player.selectedTool = tool;
        }
    }
    
    handleClick(e) {
        if (!this.game.player || this.game.player.dead) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left + this.game.camera.x;
        const clickY = e.clientY - rect.top + this.game.camera.y;
        
        let clickedResource = null;
        let closestDist = Infinity;
        
        for (let id in this.game.resources) {
            const res = this.game.resources[id];
            const dist = Math.hypot(res.x - clickX, res.y - clickY);
            if (dist < 50 && dist < closestDist) {
                closestDist = dist;
                clickedResource = id;
            }
        }
        
        if (clickedResource) {
            this.game.gather(clickedResource);
            return;
        }
        
        let clickedPlayer = null;
        closestDist = Infinity;
        
        for (let id in this.game.players) {
            if (id === this.game.player.id) continue;
            const player = this.game.players[id];
            if (player.dead) continue;
            
            const dist = Math.hypot(player.x - clickX, player.y - clickY);
            if (dist < player.radius + 10 && dist < closestDist) {
                closestDist = dist;
                clickedPlayer = id;
            }
        }
        
        if (clickedPlayer) {
            this.game.attack(clickedPlayer);
            return;
        }
        
        let clickedBuilding = null;
        closestDist = Infinity;
        
        for (let id in this.game.buildings) {
            const building = this.game.buildings[id];
            const dist = Math.hypot(building.x - clickX, building.y - clickY);
            if (dist < 40 && dist < closestDist) {
                closestDist = dist;
                clickedBuilding = id;
            }
        }
        
        if (clickedBuilding) {
            this.game.attack(clickedBuilding);
            return;
        }
        
        const buildingTools = ['wall', 'spike', 'windmill', 'turret'];
        if (buildingTools.includes(this.game.selectedTool)) {
            const dist = Math.hypot(clickX - this.game.player.x, clickY - this.game.player.y);
            if (dist < 150) {
                this.game.build(clickX, clickY);
            }
        }
    }
    
    handleRightClick(e) {
    }
    
    autoAttack() {
        if (!this.game.player || this.game.player.dead) return;
        
        let closest = null;
        let closestDist = Infinity;
        
        for (let id in this.game.players) {
            if (id === this.game.player.id) continue;
            const player = this.game.players[id];
            if (player.dead) continue;
            
            const dist = Math.hypot(
                player.x - this.game.player.x,
                player.y - this.game.player.y
            );
            
            if (dist < closestDist && dist < 200) {
                closestDist = dist;
                closest = id;
            }
        }
        
        if (closest) {
            this.game.attack(closest);
        }
    }
    
    toggleCrafting() {
        const menu = document.getElementById('craftingMenu');
        menu.classList.toggle('hidden');
    }
}