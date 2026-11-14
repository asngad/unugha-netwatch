const socketService = require('./socketService');

class HardwareService {
  constructor() {
    this.timer = null;
    this.telemetry = {
      // 1. Load Balancer Ruijie Reyee EG1510XS
      loadBalancer: {
        model: 'Ruijie Reyee RG-EG1510XS',
        ip: '192.168.111.3',
        location: 'Rack Server NOC Rektorat UNUGHA',
        role: 'Multi-WAN Load Balancer (4 ISP)',
        cpuLoad: 24,
        ramUsage: 35,
        temperatureC: 41.2,
        activeSessions: 3840,
        wanLinks: '4/4 WAN UP (Citra, Indibiz, Starlink, Starlite)',
        uptime: '38 hari, 14 jam, 20 menit'
      },
      // 2. Core Distribution Switch Mikrotik Rack
      switchRack: {
        model: 'MikroTik Switch Rack (CRS326-24G-2S+RM)',
        ip: '10.26.99.15',
        location: 'Rack Server NOC Rektorat UNUGHA',
        role: 'Distribution Core Switch 24-Port Gigabit',
        cpuLoad: 18,
        ramUsage: 26,
        temperatureC: 38.6,
        fanStatus: 'Normal (Dual Fan OK)',
        activePorts: '22/24 Port Aktif (16 AP Linksys + Server + Uplink)',
        uptime: '45 hari, 09 jam, 12 menit'
      },
      // Router alias for compatibility
      router: {
        model: 'MikroTik Switch Rack & Gateway',
        ip: '10.26.99.15',
        cpuLoad: 18,
        ramUsage: 26,
        ramUsedMb: 4096,
        temperatureC: 38.6,
        uptime: '45 hari'
      },
      // 3. Linksys EA7500 AP Fleet
      apFleet: {
        model: 'Linksys EA7500 Max-Stream AC1900',
        totalUnits: 16,
        onlineUnits: 15,
        downUnits: 1,
        totalClientsConnected: 482,
        ssidList: ['UNUGHA-Dosen-Staff', 'UNUGHA-Mahasiswa-Free', 'UNUGHA-LabFTI-5G']
      },
      // 4. Server SIAKAD
      serverSiakad: {
        name: 'Cluster Server SIAKAD & E-Learning',
        platform: 'VMware ESXi Enterprise',
        cpuLoad: 22,
        ramUsage: 36,
        ramUsedMb: 11800,
        ramTotalMb: 32768,
        diskUsagePercent: 44,
        diskFreeGb: 572,
        status: 'OPTIMAL'
      }
    };
  }

  start() {
    console.log('[HardwareService] Memulai telemetri hardware: EG1510XS (192.168.111.3), Mikrotik Rack (10.26.99.15), 16 Linksys EA7500...');
    this.tick();
    this.timer = setInterval(() => {
      this.tick();
    }, 3000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tick() {
    try {
      const cpuJitter = (Math.random() - 0.5) * 5;
      const ramJitter = (Math.random() - 0.5) * 2;
      const sessionJitter = Math.round((Math.random() - 0.5) * 60);

      // Load Balancer EG1510XS
      this.telemetry.loadBalancer.cpuLoad = Math.max(12, Math.min(80, Math.round(24 + cpuJitter)));
      this.telemetry.loadBalancer.ramUsage = Math.max(20, Math.min(65, Math.round(35 + ramJitter)));
      this.telemetry.loadBalancer.activeSessions = Math.max(1200, 3840 + sessionJitter);

      // Mikrotik SW Rack
      this.telemetry.switchRack.cpuLoad = Math.max(8, Math.min(75, Math.round(18 + cpuJitter * 0.8)));
      this.telemetry.switchRack.ramUsage = Math.max(15, Math.min(60, Math.round(26 + ramJitter)));
      this.telemetry.router.cpuLoad = this.telemetry.switchRack.cpuLoad;
      this.telemetry.router.temperatureC = this.telemetry.switchRack.temperatureC;

      // Linksys Fleet
      this.telemetry.apFleet.totalClientsConnected = Math.max(200, 482 + Math.round((Math.random() - 0.5) * 25));

      // Server SIAKAD
      this.telemetry.serverSiakad.cpuLoad = Math.max(10, Math.min(90, Math.round(22 + cpuJitter * 1.4)));
      this.telemetry.serverSiakad.ramUsage = Math.max(25, Math.min(80, Math.round(36 + ramJitter)));

      socketService.emit('hardware:update', this.telemetry);
    } catch (err) {
      console.error('[HardwareService] Error in tick:', err.message);
    }
  }

  getTelemetry() {
    return this.telemetry;
  }
}

module.exports = new HardwareService();
