const fs = require('fs');
const path = require('path');
const seeds = require('./src/database/seeds');
const dbFile = path.join(__dirname, 'data/unugha_netwatch_db.json');

const data = {
  buildings: seeds.buildings,
  devices: seeds.devices,
  topologyEdges: seeds.topologyEdges,
  incidents: seeds.initialIncidents,
  metricsHistory: [],
  users: seeds.users,
  interfaces: seeds.interfaces,
  bandwidthHistory: [],
  settings: {
    intervalSeconds: 15,
    timeoutSeconds: 2,
    latencyWarningThresholdMs: 120,
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: ''
  }
};

fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
console.log('Database successfully reseeded with:');
console.log(`- ${seeds.devices.length} Total Devices (Load Balancer EG1510XS, Mikrotik SW Rack, 4 ISPs, 16 Linksys EA7500, 2 Servers)`);
console.log(`- ${seeds.buildings.length} Buildings`);
console.log(`- ${seeds.topologyEdges.length} Topology Edges`);
console.log(`- ${seeds.interfaces.length} Multi-WAN Interfaces`);
