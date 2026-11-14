const pingService = require('./src/services/pingService');

const list = [
  { name: 'Load Balancer EG1510XS', ip: '192.168.111.3' },
  { name: 'Mikrotik SW Rack', ip: '10.26.99.15' },
  { name: '1. OpenWrt_GH1LT1 EA7500', ip: '10.27.51.12' },
  { name: '2. OpenWrt_GH2LT3 EA7500', ip: '10.27.43.253' },
  { name: '3. OpenWrt_GH1LT3_Aula EA7500', ip: '10.27.53.12' },
  { name: '4. OpenWrt_FMIKOM EA7500', ip: '10.27.23.17' },
  { name: '5. OpenWrt_GH1LT2B EA7500', ip: '10.27.52.12' },
  { name: '6. OpenWrt_PerpusAtas EA7500', ip: '10.27.22.45' },
  { name: '7. OpenWrt_LABKOM EA7500', ip: '10.27.41.12' },
  { name: '8. OpenWrt_PerpusBawah EA7500', ip: '10.27.22.29' },
  { name: '9. OpenWRT_GH1LT2A EA7500', ip: '10.26.99.19' },
  { name: '10. OpenWrt_Biro2New EA7500', ip: '10.27.23.42' },
  { name: '11. OpenWrt_RuangRapatNew EA7500', ip: '10.27.23.41' },
  { name: '12. OpenWrt_FkiZone EA7500', ip: '10.27.41.13' },
  { name: '13. OpenWrt_SSDI EA7500', ip: '10.27.42.12' },
  { name: '14. OpenWrt_RDosen EA7500', ip: '10.27.43.80' },
  { name: '15. OpenWrt_LABIOT EA7500', ip: '10.27.43.87' },
  { name: '16. OpenWrt_AulaFki EA7500', ip: '10.27.44.232' }
];

async function checkAll() {
  console.log('Probing real campus network devices:');
  for (const item of list) {
    const res = await pingService.probeIcmp(item.ip);
    console.log(`${item.ip.padEnd(16)} | ${res.alive ? 'ONLINE (UP)' : 'TIMEOUT (DOWN)'} (${res.latency || '-'}ms) | ${item.name}`);
  }
}

checkAll();
