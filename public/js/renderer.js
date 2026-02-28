class Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
    }
    
    drawPlayer(player, isLocal) {
        const ctx = this.ctx;
        const x = player.x;
        const y = player.y;
        const radius = player.radius || 25;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + radius - 5, radius, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = isLocal ? '#4a90e2' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = isLocal ? '#2c5aa0' : '#c0392b';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        const angle = player.angle || 0;
        const handDist = radius + 10;
        const handX = x + Math.cos(angle) * handDist;
        const handY = y + Math.sin(angle) * handDist;
        
        ctx.save();
        ctx.translate(handX, handY);
        ctx.rotate(angle);
        
        if (player.selectedTool === 'sword' || player.tools?.sword) {
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(0, -3, 25, 6);
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(0, -6, 8, 12);
        } else if (player.selectedTool === 'pickaxe' || player.tools?.pickaxe) {
            ctx.strokeStyle = '#5d4037';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(20, -10);
            ctx.stroke();
            ctx.fillStyle = '#95a5a6';
            ctx.beginPath();
            ctx.moveTo(20, -10);
            ctx.lineTo(25, -15);
            ctx.lineTo(22, -8);
            ctx.lineTo(28, -5);
            ctx.lineTo(20, -10);
            ctx.fill();
        } else if (player.selectedTool === 'bow' || player.tools?.bow) {
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(10, 0, 10, -Math.PI/2, Math.PI/2);
            ctx.stroke();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(10, -10);
            ctx.lineTo(10, 10);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#f4c2a1';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        if (player.age >= 2) {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.moveTo(x - radius, y - radius + 5);
            ctx.lineTo(x, y - radius - 15);
            ctx.lineTo(x + radius, y - radius + 5);
            ctx.fill();
        }
    }
    
    drawPlayerInfo(player) {
        const ctx = this.ctx;
        const x = player.x;
        const y = player.y - 40;
        
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(player.name, x, y);
        ctx.fillText(player.name, x, y);
        
        const barWidth = 50;
        const barHeight = 6;
        const healthPercent = player.health / player.maxHealth;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - barWidth/2, y + 5, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(x - barWidth/2, y + 5, barWidth * healthPercent, barHeight);
    }
    
    drawResource(resource) {
        const ctx = this.ctx;
        const x = resource.x;
        const y = resource.y;
        const scale = resource.scale || 1;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        if (resource.resourceType === 'tree' || resource.type === 'wood') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 35, 30, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-10, 0, 20, 40);
            
            ctx.fillStyle = resource.color || '#2d5a27';
            ctx.beginPath();
            ctx.moveTo(-40, 10);
            ctx.lineTo(0, -50);
            ctx.lineTo(40, 10);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(-35, -10);
            ctx.lineTo(0, -60);
            ctx.lineTo(35, -10);
            ctx.fill();
            
        } else if (resource.resourceType === 'rock' || resource.type === 'stone') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 25, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = resource.color || '#7a7a7a';
            ctx.beginPath();
            ctx.moveTo(-25, 10);
            ctx.lineTo(-15, -15);
            ctx.lineTo(10, -20);
            ctx.lineTo(25, 5);
            ctx.lineTo(15, 25);
            ctx.lineTo(-20, 20);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(-15, -5);
            ctx.lineTo(-10, -12);
            ctx.lineTo(5, -10);
            ctx.fill();
            
        } else if (resource.resourceType === 'bush' || resource.type === 'food') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 20, 25, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#2d5a27';
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#d42c2c';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const bx = Math.cos(angle) * 15;
                const by = Math.sin(angle) * 15;
                ctx.beginPath();
                ctx.arc(bx, by, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (resource.resourceType === 'gold' || resource.type === 'gold') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(0, 20, 20, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#b8860b';
            ctx.beginPath();
            ctx.moveTo(-20, 10);
            ctx.lineTo(-10, -10);
            ctx.lineTo(10, -15);
            ctx.lineTo(20, 5);
            ctx.lineTo(10, 20);
            ctx.lineTo(-15, 18);
            ctx.fill();
            
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(-5, 0);
            ctx.lineTo(0, -8);
            ctx.lineTo(8, -5);
            ctx.lineTo(5, 5);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawBuilding(building) {
        const ctx = this.ctx;
        const x = building.x;
        const y = building.y;
        
        ctx.save();
        ctx.translate(x, y);
        
        if (building.type === 'wall') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(-32, -32, 64, 64);
            
            ctx.fillStyle = '#8b7355';
            ctx.fillRect(-30, -30, 60, 60);
            
            ctx.strokeStyle = '#6b5344';
            ctx.lineWidth = 2;
            ctx.strokeRect(-30, -30, 60, 60);
            ctx.beginPath();
            ctx.moveTo(-30, 0);
            ctx.lineTo(30, 0);
            ctx.moveTo(0, -30);
            ctx.lineTo(0, 30);
            ctx.stroke();
            
        } else if (building.type === 'spike') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.moveTo(0, 35);
            ctx.lineTo(-25, 40);
            ctx.lineTo(25, 40);
            ctx.fill();
            
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.lineTo(-20, 30);
            ctx.lineTo(0, 20);
            ctx.lineTo(20, 30);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.stroke();
            
        } else if (building.type === 'windmill') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 45, 25, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#d4a373';
            ctx.fillRect(-15, 0, 30, 40);
            
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.moveTo(-20, 0);
            ctx.lineTo(0, -20);
            ctx.lineTo(20, 0);
            ctx.fill();
            
            ctx.save();
            ctx.translate(0, -10);
            const rotation = Date.now() / 1000;
            ctx.rotate(rotation);
            
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI) / 2);
                ctx.fillRect(-3, -35, 6, 35);
                ctx.restore();
            }
            ctx.restore();
            
        } else if (building.type === 'turret') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 35, 30, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(0, 10, 25, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#333';
            ctx.fillRect(-8, -20, 16, 35);
            
            ctx.fillStyle = '#777';
            ctx.beginPath();
            ctx.arc(0, 10, 15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if (building.health < building.maxHealth) {
            const barWidth = 40;
            const healthPercent = building.health / building.maxHealth;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(-barWidth/2, -50, barWidth, 6);
            
            ctx.fillStyle = healthPercent > 0.5 ? '#2ecc71' : '#e74c3c';
            ctx.fillRect(-barWidth/2, -50, barWidth * healthPercent, 6);
        }
        
        ctx.restore();
    }
    
    drawProjectile(proj) {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y);
        ctx.lineTo(
            proj.x - Math.cos(proj.angle) * 15,
            proj.y - Math.sin(proj.angle) * 15
        );
        ctx.stroke();
    }
}