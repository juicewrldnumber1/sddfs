const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const Game = require('./game/Game');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

app.use(express.static(path.join(__dirname, '../public')));

const game = new Game();

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  socket.emit('init', {
    mapSize: game.world.size,
    resources: game.world.resources,
    buildings: game.world.buildings
  });
  
  socket.on('join', (data) => {
    const player = game.addPlayer(socket.id, data.name);
    socket.emit('playerData', player);
    io.emit('playerJoined', { id: socket.id, player });
    io.emit('players', game.players);
  });
  
  socket.on('move', (data) => {
    game.updatePlayer(socket.id, data);
    socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
  });
  
  socket.on('gather', (resourceId) => {
    const result = game.gatherResource(socket.id, resourceId);
    if (result.success) {
      socket.emit('resourceGathered', result);
      io.emit('resourceRemoved', resourceId);
      io.emit('resourceAdded', result.newResource);
    }
  });
  
  socket.on('build', (data) => {
    const result = game.build(socket.id, data);
    if (result.success) {
      io.emit('buildingPlaced', result.building);
      socket.emit('inventoryUpdate', result.inventory);
    }
  });
  
  socket.on('attack', (data) => {
    const result = game.attack(socket.id, data);
    if (result.hit) {
      io.emit('playerHit', result);
      if (result.killed) {
        io.emit('playerKilled', { killer: socket.id, victim: result.targetId });
      }
    }
  });
  
  socket.on('craft', (itemType) => {
    const result = game.craft(socket.id, itemType);
    if (result.success) {
      socket.emit('itemCrafted', result);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    game.removePlayer(socket.id);
    io.emit('playerLeft', socket.id);
  });
});

setInterval(() => {
  game.update();
  io.emit('gameState', game.getState());
}, 1000 / 20);

setInterval(() => {
  const resource = game.world.spawnResource();
  if (resource) {
    io.emit('resourceAdded', resource);
  }
}, 2000);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;