const db = require('./src/database/db');
const devs = db.getDevices();
console.log('Total devices in DB:', devs.length);
devs.forEach((d, idx) => {
  console.log(`${idx + 1}. [${d.id}] ${d.name} (${d.ip}) - Status: ${d.status}, Latency: ${d.latency}ms, Building: ${d.buildingId}`);
});
