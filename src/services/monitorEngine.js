const db = require('../database/db');
const pingService = require('./pingService');
const alertService = require('./alertService');
const socketService = require('./socketService');

class MonitorEngine {
  constructor() {
    this.timer = null;
    this.isProbing = false;
    this.intervalSeconds = 15;
    this.probeCount = 0;
  }

  start() {
    const settings = db.getSettings();
    this.intervalSeconds = settings.intervalSeconds || 15;

    console.log(`[MonitorEngine] Memulai pemantauan background (Interval: ${this.intervalSeconds}s)...`);
    
    // Jalankan satu putaran langsung saat startup
    this.runCycle();

    // Jadwalkan putaran periodik
    this.timer = setInterval(() => {
      this.runCycle();
    }, this.intervalSeconds * 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('[MonitorEngine] Pemantauan background dihentikan.');
  }

  restart() {
    this.stop();
    this.start();
  }

  /**
   * Menjalankan satu siklus pemantauan seluruh perangkat yang aktif
   */
  async runCycle() {
    if (this.isProbing) {
      console.log('[MonitorEngine] Putaran sebelumnya masih berjalan, menunda...');
      return;
    }

    this.isProbing = true;
    this.probeCount++;

    try {
      const devices = db.getDevices().filter(d => d.isMonitored);
      const settings = db.getSettings();
      const warningThreshold = settings.latencyWarningThresholdMs || 120;
      const timeoutSec = settings.timeoutSeconds || 2;

      // Jalankan probe secara paralel dengan batasan concurency batch (5 perangkat per batch)
      const batchSize = 5;
      const results = [];

      for (let i = 0; i < devices.length; i += batchSize) {
        const batch = devices.slice(i, i + batchSize);
        const batchPromises = batch.map(async (device) => {
          const probeRes = await pingService.probe(device, { timeoutSeconds: timeoutSec });
          return { device, probeRes };
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      let totalLatencySum = 0;
      let validLatencyCount = 0;
      let countUp = 0;
      let countDown = 0;
      let countWarning = 0;

      for (const { device, probeRes } of results) {
        const previousStatus = device.status || 'UNKNOWN';
        let newStatus = 'DOWN';

        if (probeRes.alive) {
          if (probeRes.latency && probeRes.latency > warningThreshold) {
            newStatus = 'WARNING';
            countWarning++;
          } else {
            newStatus = 'UP';
            countUp++;
          }

          if (probeRes.latency) {
            totalLatencySum += probeRes.latency;
            validLatencyCount++;
          }
        } else {
          newStatus = 'DOWN';
          countDown++;
        }

        // Kalkulasi update uptime percentage secara dinamis
        const currentUptime = device.uptimePercentage || 99.0;
        const targetValue = probeRes.alive ? 100 : 0;
        const newUptime = Math.min(100, Math.max(80, +(currentUptime * 0.98 + targetValue * 0.02).toFixed(2)));

        const updatedDevice = db.updateDevice(device.id, {
          status: newStatus,
          latency: probeRes.latency,
          packetLoss: probeRes.packetLoss,
          lastChecked: new Date().toISOString(),
          uptimePercentage: newUptime
        });

        // Deteksi Transisi Status
        if (previousStatus !== 'DOWN' && newStatus === 'DOWN') {
          // Perangkat mengalami gangguan (Baru Jatuh / Down)
          const buildings = db.getBuildings();
          const bld = buildings.find(b => b.id === device.buildingId);
          const bldName = bld ? bld.name : 'Area Kampus UNUGHA';

          const incident = db.createIncident({
            deviceId: device.id,
            deviceName: device.name,
            buildingName: bldName,
            type: 'DOWN',
            message: probeRes.error || `RTO: Tidak merespon paket probe (${probeRes.packetLoss}% packet loss)`
          });

          alertService.notifyDown(device, incident);
          socketService.broadcastIncidentNew(incident);
        } else if (previousStatus === 'DOWN' && (newStatus === 'UP' || newStatus === 'WARNING')) {
          // Perangkat Pulih (Recovery)
          const resolvedInc = db.resolveActiveIncident(device.id);
          const durationMins = resolvedInc 
            ? Math.round((new Date(resolvedInc.resolvedAt).getTime() - new Date(resolvedInc.startedAt).getTime()) / 60000)
            : 0;

          alertService.notifyRecovery(device, durationMins);
          if (resolvedInc) {
            socketService.broadcastIncidentResolved(resolvedInc);
          }
        }

        // Siarkan update perangkat individual via WebSocket
        socketService.broadcastDeviceUpdate(updatedDevice);
      }

      const avgLatency = validLatencyCount > 0 ? Math.round(totalLatencySum / validLatencyCount) : 0;

      // Simpan sampel metrik time-series untuk grafik
      const sample = {
        avgLatency,
        totalUp: countUp + countWarning,
        totalDown: countDown,
        totalDevices: devices.length
      };
      db.addMetric(sample);
      socketService.broadcastMetricSample(sample);

      // Siarkan ringkasan status global
      const summary = {
        totalDevices: devices.length,
        up: countUp,
        warning: countWarning,
        down: countDown,
        avgLatency,
        lastCycleTime: new Date().toISOString(),
        cycleNumber: this.probeCount
      };
      socketService.broadcastSummary(summary);

    } catch (err) {
      console.error('[MonitorEngine] Kesalahan pada siklus pemantauan:', err);
    } finally {
      this.isProbing = false;
    }
  }

  /**
   * Manual probe tunggal untuk satu perangkat via tombol "Ping Now" di UI
   */
  async probeSingle(deviceId) {
    const device = db.getDeviceById(deviceId);
    if (!device) return { error: 'Device not found' };

    const settings = db.getSettings();
    const probeRes = await pingService.probe(device, { timeoutSeconds: settings.timeoutSeconds || 2 });

    const updated = db.updateDevice(deviceId, {
      status: probeRes.alive ? (probeRes.latency > settings.latencyWarningThresholdMs ? 'WARNING' : 'UP') : 'DOWN',
      latency: probeRes.latency,
      packetLoss: probeRes.packetLoss,
      lastChecked: new Date().toISOString()
    });

    socketService.broadcastDeviceUpdate(updated);
    return { device: updated, probeRes };
  }
}

module.exports = new MonitorEngine();
