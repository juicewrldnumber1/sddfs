class Player {
  constructor(id, name, world) {
    this.id = id;
    this.name = name || 'Player';
    this.x = Math.random() * world.size;
    this.y = Math.random() * world.size;
    this.radius = 25;
    this.speed = 3;
    this.angle = 0;
    
    this.health = 100;
    this.maxHealth = 100;
    this.dead = false;
    this.respawnTimer = 0;
    
    this.damage = 10;
    this.range = 60;
    this.gatherSpeed = 1;
    
    this.inventory = {
      wood: 0,
      stone: 0,
      food: 0,
      gold: 0
    };
    
    this.tools = {};
    this.selectedTool = 'hand';
    
    this.windmills = 0;
    this.goldGenTimer = 0;
    
    this.age = 1;
    this.xp = 0;
  }
  
  update(data) {
    if (this.dead) return;
    
    if (data.x !== undefined) this.x = data.x;
    if (data.y !== undefined) this.y = data.y;
    if (data.angle !== undefined) this.angle = data.angle;
    if (data.selectedTool !== undefined) this.selectedTool = data.selectedTool;
    
    this.x = Math.max(0, Math.min(this.x, 3000));
    this.y = Math.max(0, Math.min(this.y, 3000));
  }
  
  respawn(world) {
    this.dead = false;
    this.health = this.maxHealth;
    this.x = Math.random() * world.size;
    this.y = Math.random() * world.size;
    this.inventory = { wood: 0, stone: 0, food: 0, gold: 0 };
    this.windmills = 0;
  }
  
  getData() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      radius: this.radius,
      angle: this.angle,
      health: this.health,
      maxHealth: this.maxHealth,
      dead: this.dead,
      inventory: this.inventory,
      selectedTool: this.selectedTool,
      tools: this.tools,
      age: this.age,
      windmills: this.windmills
    };
  }
}

module.exports = Player;