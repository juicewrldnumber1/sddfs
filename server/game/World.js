const { v4: uuidv4 } = require('uuid');

class World {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.size = Math.max(width, height);
    this.resources = {};
    this.buildings = {};
    
    this.generateResources();
  }
  
  generateResources() {
    for (let i = 0; i < 200; i++) {
      this.spawnResource('tree');
    }
    
    for (let i = 0; i < 100; i++) {
      this.spawnResource('rock');
    }
    
    for (let i = 0; i < 80; i++) {
      this.spawnResource('bush');
    }
    
    for (let i = 0; i < 20; i++) {
      this.spawnResource('gold');
    }
  }
  
  spawnResource(type) {
    const types = {
      tree: { type: 'wood', amount: 10, scale: 1, color: '#2d5a27' },
      rock: { type: 'stone', amount: 5, scale: 0.8, color: '#7a7a7a' },
      bush: { type: 'food', amount: 5, scale: 0.6, color: '#d42c2c' },
      gold: { type: 'gold', amount: 3, scale: 0.7, color: '#ffd700' }
    };
    
    if (!type) {
      const keys = Object.keys(types);
      type = keys[Math.floor(Math.random() * keys.length)];
    }
    
    const resourceType = types[type];

    // Ensure the resourceType is valid to prevent runtime errors if an unknown type is passed
    if (!resourceType) {
      console.warn(`Attempted to spawn unknown resource type: "${type}". Skipping.`);
      return null;
    }
    
    const resource = {
      id: uuidv4(),
      type: resourceType.type,
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      amount: resourceType.amount,
      scale: resourceType.scale,
      color: resourceType.color,
      resourceType: type
    };
    
    this.resources[resource.id] = resource;
    return resource;
  }
}

module.exports = World;