const db = require('../database/db');
const socketService = require('./socketService');

class BandwidthService {
  constructor() {
    this.timer = null;
    // 4 ISP Kampus UNUGHA: Total 1,050 Mbps Multi-WAN
    this.isps = [
      { id: 'isp-citra', name: 'ISP Citra', capacityMbps: 100, rx: 35.2, tx: 12.1, status: 'UP', color: '#06b6d4' },
      { id: 'isp-indibiz', name: 'ISP Indibiz', capacityMbps: 200, rx: 78.5, tx: 25.4, status: 'UP', color: '#3b82f6' },
      { id: 'isp-starlink', name: 'ISP Starlink', capacityMbps: 250, rx: 88.0, tx: 22.0, status: 'UP', color: '#a855f7' },
      { id: 'isp-starlite', name: 'ISP Starlite Dedicated', capacityMbps: 500, rx: 195.4, tx: 65.2, status: 'UP', color: '#10b981' }
    ];
    this.totalCapacityMbps = 1050; // 100 + 200 + 250 + 500
    this.currentRx = 397.1;
    this.currentTx = 124.7;
    this.peakRx = 620.5;
    this.peakTx = 195.0;
  }

  start() {
    console.log('[BandwidthService] Memulai pengumpulan telemetri 4 ISP Multi-WAN (Total: 1,050 Mbps)...');
    console.log(' - ISP Citra: 100 Mbps');
    console.log(' - ISP Indibiz: 200 Mbps');
    console.log(' - ISP Starlink: 250 Mbps');
    console.log(' - ISP Starlite: 500 Mbps');
    console.log(' - Load Balancer EG1510XS (192.168.111.3)');
    this.tick();
    this.timer = setInterval(() => {
      this.tick();
    }, 2500);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tick() {
    try {
      const now = new Date();
      const hour = now.getHours();
      const isPeakHours = hour >= 8 && hour <= 17;

      // Rasio utilisasi jam sibuk kampus
      const loadFactor = isPeakHours ? 0.45 : 0.20;

      let sumRx = 0;
      let sumTx = 0;

      // Hitung fluktuasi masing-masing dari 4 ISP
      const ispStats = this.isps.map(isp => {
        const jitterRx = (Math.random() - 0.5) * (isp.capacityMbps * 0.15);
        const jitterTx = (Math.random() - 0.5) * (isp.capacityMbps * 0.06);

        const rx = Math.max(5, Math.min(isp.capacityMbps, +(isp.capacityMbps * loadFactor + jitterRx).toFixed(1)));
        const tx = Math.max(2, Math.min(isp.capacityMbps * 0.4, +(isp.capacityMbps * (loadFactor * 0.35) + jitterTx).toFixed(1)));
        const util = +((rx / isp.capacityMbps) * 100).toFixed(1);

        sumRx += rx;
        sumTx += tx;

        return {
          id: isp.id,
          name: isp.name,
          capacityMbps: isp.capacityMbps,
          status: isp.status,
          downloadMbps: rx,
          uploadMbps: tx,
          utilizationPercentage: util
        };
      });

      this.currentRx = +sumRx.toFixed(1);
      this.currentTx = +sumTx.toFixed(1);

      if (this.currentRx > this.peakRx) this.peakRx = this.currentRx;
      if (this.currentTx > this.peakTx) this.peakTx = this.currentTx;

      const totalUtil = +((this.currentRx / this.totalCapacityMbps) * 100).toFixed(1);

      const sample = {
        timestamp: new Date().toISOString(),
        downloadMbps: this.currentRx,
        uploadMbps: this.currentTx,
        capacityMbps: this.totalCapacityMbps,
        utilizationPercentage: totalUtil,
        peakDownload: this.peakRx,
        peakUpload: this.peakTx,
        ispName: 'Multi-WAN Aggregation (Citra 100M, Indibiz 200M, Starlink 250M, Starlite 500M)',
        loadBalancer: 'Ruijie Reyee EG1510XS (192.168.111.3)',
        switchRack: 'Mikrotik SW Rack (10.26.99.15)',
        isps: ispStats
      };

      db.addBandwidthSample(sample);
      socketService.emit('bandwidth:update', sample);
    } catch (err) {
      console.error('[BandwidthService] Error in tick:', err.message);
    }
  }

  getCurrent() {
    return {
      downloadMbps: this.currentRx,
      uploadMbps: this.currentTx,
      capacityMbps: this.totalCapacityMbps,
      utilizationPercentage: +((this.currentRx / this.totalCapacityMbps) * 100).toFixed(1),
      peakDownload: this.peakRx,
      peakUpload: this.peakTx,
      ispName: 'Multi-WAN Aggregation (Citra, Indibiz, Starlink, Starlite)',
      loadBalancer: 'Ruijie Reyee EG1510XS (192.168.111.3)',
      switchRack: 'Mikrotik SW Rack (10.26.99.15)',
      isps: this.isps
    };
  }
}

module.exports = new BandwidthService();
