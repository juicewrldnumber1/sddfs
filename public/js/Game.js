import Renderer from './Renderer.js';
import UI from './UI.js';
import Network from './Network.js';
import Input from './Input.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.player = null;
        this.players = {};
        this.resources = {};
        this.buildings = {};
        this.projectiles = [];

        this.camera = { x: 0, y: 0 };
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.selectedTool = 'hand';

        this.socket = null;
        this.renderer = new Renderer(this);
        this.ui = new UI(this);

        this.loop = this.loop.bind(this);
        this.handleResize = this.handleResize.bind(this);

        window.addEventListener('resize', this.handleResize);
        this.lastTime = 0;
        requestAnimationFrame(this.loop);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        this.resize();
    }

    start(playerName) {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameUI').classList.remove('hidden');

        this.network = new Network(this);
        this.network.connect(playerName);
        this.input = new Input(this);
    }

    update(deltaTime) {
        if (!this.player || this.player.dead) return;

        let dx = 0;
        let dy = 0;

        if (this.keys['w'] || this.keys['arrowup']) dy = -1;
        if (this.keys['s'] || this.keys['arrowdown']) dy = 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx = -1;
        if (this.keys['d'] || this.keys['arrowright']) dx = 1;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        if (dx !== 0 || dy !== 0) {
            this.player.x += dx * this.player.speed;
            this.player.y += dy * this.player.speed;

            this.player.x = Math.max(0, Math.min(this.player.x, 3000));
            this.player.y = Math.max(0, Math.min(this.player.y, 3000));

            this.network.sendMove(this.player);
        }

        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        this.camera.x = Math.max(0, Math.min(this.camera.x, 3000 - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, 3000 - this.canvas.height));
    }

    render() {
        this.ctx.fillStyle = '#7cba3d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        this.drawGrid();

        for (let id in this.resources) {
            this.renderer.drawResource(this.resources[id]);
        }

        for (let id in this.buildings) {
            this.renderer.drawBuilding(this.buildings[id]);
        }

        for (let id in this.players) {
            if (!this.players[id].dead) {
                this.renderer.drawPlayer(this.players[id], id === this.player?.id);
            }
        }

        for (let proj of this.projectiles) {
            this.renderer.drawProjectile(proj);
        }

        for (let id in this.players) {
            if (!this.players[id].dead) {
                this.renderer.drawPlayerInfo(this.players[id]);
            }
        }

        this.ctx.restore();
        this.drawMinimap();
    }

    drawGrid() {
        const gridSize = 100;
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.lineWidth = 1;

        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = startX + this.canvas.width + gridSize;
        const endY = startY + this.canvas.height + gridSize;

        this.ctx.beginPath();
        for (let x = startX; x < endX; x += gridSize) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, Math.min(endY, 3000));
        }
        for (let y = startY; y < endY; y += gridSize) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(Math.min(endX, 3000), y);
        }
        this.ctx.stroke();
    }

    drawMinimap() {
        const mapSize = 150;
        const x = this.canvas.width - mapSize - 20;
        const y = 20;
        const scale = mapSize / 3000;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(x, y, mapSize, mapSize);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, mapSize, mapSize);

        for (let id in this.resources) {
            const res = this.resources[id];
            const mx = x + res.x * scale;
            const my = y + res.y * scale;

            if (res.type === 'wood') this.ctx.fillStyle = '#2d5a27';
            else if (res.type === 'stone') this.ctx.fillStyle = '#7a7a7a';
            else if (res.type === 'food') this.ctx.fillStyle = '#d42c2c';
            else if (res.type === 'gold') this.ctx.fillStyle = '#ffd700';

            this.ctx.fillRect(mx - 1, my - 1, 3, 3);
        }

        for (let id in this.players) {
            const p = this.players[id];
            if (p.dead) continue;

            const mx = x + p.x * scale;
            const my = y + p.y * scale;

            this.ctx.fillStyle = id === this.player?.id ? '#00ffff' : '#ff3333';
            this.ctx.beginPath();
            this.ctx.arc(mx, my, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            x + this.camera.x * scale,
            y + this.camera.y * scale,
            Math.min(this.canvas.width * scale, mapSize),
            Math.min(this.canvas.height * scale, mapSize)
        );
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.loop);
    }

    gather(resourceId) {
        if (this.network) {
            this.network.socket.emit('gather', resourceId);
        }
    }

    build(x, y) {
        if (this.network) {
            this.network.socket.emit('build', { type: this.selectedTool, x, y });
        }
    }

    attack(targetId) {
        if (this.network) {
            this.network.socket.emit('attack', { targetId });
        }
    }

    craft(item) {
        if (this.network) {
            this.network.socket.emit('craft', item);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();

    document.getElementById('playBtn').addEventListener('click', () => {
        const name = document.getElementById('playerName').value.trim() || 'Player';
        window.game.start(name);
    });

    document.getElementById('playerName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('playBtn').click();
        }
    });
});