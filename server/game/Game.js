const Player = require('./Player');
const World = require('./World');
const { v4: uuidv4 } = require('uuid');

class Game {
  constructor() {
    this.players = {};
    this.world = new World(3000, 3000);
    this.projectiles = [];
  }
  
  addPlayer(id, name) {
    const player = new Player(id, name, this.world);
    this.players[id] = player;
    return player.getData();
  }
  
  removePlayer(id) {
    delete this.players[id];
  }
  
  updatePlayer(id, data) {
    if (this.players[id]) {
      this.players[id].update(data);
    }
  }
  
  gatherResource(playerId, resourceId) {
    const player = this.players[playerId];
    const resource = this.world.resources[resourceId];
    
    if (!player || !resource) return { success: false };
    
    const dist = Math.hypot(player.x - resource.x, player.y - resource.y);
    if (dist > 100) return { success: false };
    
    player.inventory[resource.type] = (player.inventory[resource.type] || 0) + resource.amount;
    delete this.world.resources[resourceId];
    const newResource = this.world.spawnResource();
    
    return {
      success: true,
      type: resource.type,
      amount: resource.amount,
      newResource
    };
  }
  
  build(playerId, data) {
    const player = this.players[playerId];
    if (!player) return { success: false };
    
    const costs = this.getBuildingCost(data.type);
    
    for (let [resource, amount] of Object.entries(costs)) {
      if ((player.inventory[resource] || 0) < amount) {
        return { success: false, reason: 'Insufficient resources' };
      }
    }
    
    for (let [resource, amount] of Object.entries(costs)) {
      player.inventory[resource] -= amount;
    }
    
    const building = {
      id: uuidv4(),
      type: data.type,
      x: data.x,
      y: data.y,
      owner: playerId,
      health: this.getBuildingHealth(data.type),
      maxHealth: this.getBuildingHealth(data.type)
    };
    
    this.world.buildings[building.id] = building;
    
    // Fix: Increment player's windmill count when a windmill is built
    if (building.type === 'windmill') {
      player.windmills = (player.windmills || 0) + 1;
    }
    
    return {
      success: true,
      building,
      inventory: player.inventory
    };
  }
  
  attack(attackerId, data) {
    const attacker = this.players[attackerId];
    if (!attacker || attacker.dead) return { hit: false };
    
    const targetId = data.targetId;
    const target = this.players[targetId];
    
    if (!target || target.dead) {
      const building = this.world.buildings[targetId];
      if (building) {
        const dist = Math.hypot(attacker.x - building.x, attacker.y - building.y);
        if (dist < attacker.range + 50) {
          building.health -= attacker.damage;
          if (building.health <= 0) {
            // Fix: Decrement player's windmill count when a windmill is destroyed
            if (building.type === 'windmill') {
              const ownerPlayer = this.players[building.owner];
              if (ownerPlayer) { // Ensure owner exists
                ownerPlayer.windmills = Math.max(0, (ownerPlayer.windmills || 0) - 1);
              }
            }
            delete this.world.buildings[building.id];
            return { hit: true, destroyed: true, targetId: building.id };
          }
          return { hit: true, building: true, targetId: building.id, health: building.health };
        }
      }
      return { hit: false };
    }
    
    const dist = Math.hypot(attacker.x - target.x, attacker.y - target.y);
    if (dist > attacker.range + 30) return { hit: false };
    
    target.health -= attacker.damage;
    
    if (target.health <= 0) {
      target.dead = true;
      target.respawnTimer = 5000;
      const droppedResources = { ...target.inventory };
      target.inventory = { wood: 0, stone: 0, food: 0, gold: 0 };
      
      return {
        hit: true,
        killed: true,
        targetId,
        droppedResources
      };
    }
    
    return {
      hit: true,
      targetId,
      health: target.health,
      maxHealth: target.maxHealth
    };
  }
  
  craft(playerId, itemType) {
    const player = this.players[playerId];
    if (!player) return { success: false };
    
    const recipes = {
      pickaxe: { wood: 10, stone: 5 },
      sword: { wood: 15, stone: 10 },
      bow: { wood: 20, stone: 5 },
      arrow: { wood: 2, stone: 1 }
    };
    
    const recipe = recipes[itemType];
    if (!recipe) return { success: false };
    
    for (let [resource, amount] of Object.entries(recipe)) {
      if ((player.inventory[resource] || 0) < amount) {
        return { success: false };
      }
    }
    
    for (let [resource, amount] of Object.entries(recipe)) {
      player.inventory[resource] -= amount;
    }
    
    player.tools[itemType] = true;
    if (itemType === 'sword') {
      player.damage = 25;
      player.range = 80;
    } else if (itemType === 'pickaxe') {
      player.gatherSpeed = 2;
    }
    
    return {
      success: true,
      item: itemType,
      inventory: player.inventory
    };
  }
  
  getBuildingCost(type) {
    const costs = {
      wall: { wood: 10 },
      spike: { wood: 15, stone: 5 },
      windmill: { wood: 50, stone: 20 },
      turret: { wood: 100, stone: 50, gold: 10 }
    };
    return costs[type] || { wood: 10 };
  }
  
  getBuildingHealth(type) {
    const health = {
      wall: 300,
      spike: 150,
      windmill: 200,
      turret: 400
    };
    return health[type] || 200;
  }
  
  update() {
    for (let id in this.players) {
      const player = this.players[id];
      if (player.dead && player.respawnTimer > 0) {
        player.respawnTimer -= 50;
        if (player.respawnTimer <= 0) {
          player.respawn(this.world);
        }
      }
      
      // The (player.windmills || 0) handles cases where it's not initialized
      // but the additions in build/attack methods ensure it's properly maintained.
      if (player.windmills > 0) {
        player.goldGenTimer = (player.goldGenTimer || 0) + 1;
        if (player.goldGenTimer >= 60) {
          player.inventory.gold = (player.inventory.gold || 0) + player.windmills;
          player.goldGenTimer = 0;
        }
      }
    }
    
    this.projectiles = this.projectiles.filter(proj => {
      proj.x += Math.cos(proj.angle) * proj.speed;
      proj.y += Math.sin(proj.angle) * proj.speed;
      proj.life--;
      
      for (let id in this.players) {
        const player = this.players[id];
        if (id !== proj.owner && !player.dead) {
          const dist = Math.hypot(proj.x - player.x, proj.y - player.y);
          if (dist < 30) {
            player.health -= 15;
            return false;
          }
        }
      }
      
      return proj.life > 0;
    });
  }
  
  getState() {
    return {
      players: Object.fromEntries(
        Object.entries(this.players).map(([id, p]) => [id, p.getData()])
      ),
      projectiles: this.projectiles,
      buildings: this.world.buildings
    };
  }
}

module.exports = Game;