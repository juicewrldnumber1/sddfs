class Network {
    constructor(game) {
        this.game = game;
        this.socket = null;
    }
    
    connect(playerName) {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.socket.emit('join', { name: playerName });
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        
        this.socket.on('init', (data) => {
            this.game.resources = data.resources;
            this.game.buildings = data.buildings;
        });
        
        this.socket.on('playerData', (data) => {
            this.game.player = data;
            this.game.players[data.id] = data;
        });
        
        this.socket.on('playerJoined', (data) => {
            this.game.players[data.id] = data.player;
        });
        
        this.socket.on('players', (players) => {
            this.game.players = players;
        });
        
        this.socket.on('playerMoved', (data) => {
            if (this.game.players[data.id]) {
                this.game.players[data.id].x = data.x;
                this.game.players[data.id].y = data.y;
                this.game.players[data.id].angle = data.angle;
            }
        });
        
        this.socket.on('playerLeft', (id) => {
            delete this.game.players[id];
        });
        
        this.socket.on('resourceGathered', (data) => {
            if (data.id === this.game.player?.id) {
                this.game.player.inventory[data.type] = 
                    (this.game.player.inventory[data.type] || 0) + data.amount;
                this.game.ui.updateResources();
            }
        });
        
        this.socket.on('resourceRemoved', (id) => {
            delete this.game.resources[id];
        });
        
        this.socket.on('resourceAdded', (resource) => {
            this.game.resources[resource.id] = resource;
        });
        
        this.socket.on('buildingPlaced', (building) => {
            this.game.buildings[building.id] = building;
        });
        
        this.socket.on('inventoryUpdate', (inventory) => {
            if (this.game.player) {
                this.game.player.inventory = inventory;
                this.game.ui.updateResources();
            }
        });
        
        this.socket.on('playerHit', (data) => {
            if (data.targetId === this.game.player?.id) {
                this.game.player.health = data.health;
                this.game.ui.updateHealth();
                this.game.ui.shakeScreen();
            }
        });
        
        this.socket.on('playerKilled', (data) => {
            if (data.victim === this.game.player?.id) {
                this.game.player.dead = true;
                this.game.ui.showDeathScreen();
            }
            
            if (this.game.players[data.victim]) {
                this.game.players[data.victim].dead = true;
            }
        });
        
        this.socket.on('itemCrafted', (data) => {
            if (this.game.player) {
                this.game.player.inventory = data.inventory;
                this.game.player.tools[data.item] = true;
                this.game.ui.updateResources();
            }
        });
        
        this.socket.on('gameState', (state) => {
            for (let id in state.players) {
                if (id !== this.game.player?.id) {
                    this.game.players[id] = state.players[id];
                }
            }
            
            this.game.projectiles = state.projectiles;
            
            for (let id in state.buildings) {
                if (!this.game.buildings[id]) {
                    this.game.buildings[id] = state.buildings[id];
                } else {
                    this.game.buildings[id].health = state.buildings[id].health;
                }
            }
            
            for (let id in this.game.buildings) {
                if (!state.buildings[id]) {
                    delete this.game.buildings[id];
                }
            }
        });
    }
    
    sendMove(player) {
        if (!this.socket) return;
        
        this.socket.emit('move', {
            x: player.x,
            y: player.y,
            angle: player.angle,
            selectedTool: player.selectedTool
        });
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}