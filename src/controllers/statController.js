const db = require('../database/db');
const alertService = require('../services/alertService');
const monitorEngine = require('../services/monitorEngine');
const socketService = require('../services/socketService');

exports.getSummaryStats = (req, res) => {
  try {
    const devices = db.getDevices();
    const upCount = devices.filter(d => d.status === 'UP').length;
    const warnCount = devices.filter(d => d.status === 'WARNING').length;
    const downCount = devices.filter(d => d.status === 'DOWN').length;
    const unknownCount = devices.filter(d => d.status === 'UNKNOWN').length;

    const latencies = devices
      .filter(d => (d.status === 'UP' || d.status === 'WARNING') && typeof d.latency === 'number')
      .map(d => d.latency);

    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 0;

    const uptimes = devices.map(d => d.uptimePercentage || 99.0);
    const overallSla = uptimes.length > 0
      ? +(uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(2)
      : 99.0;

    res.json({
      success: true,
      data: {
        totalDevices: devices.length,
        up: upCount,
        warning: warnCount,
        down: downCount,
        unknown: unknownCount,
        healthyRate: devices.length > 0 ? +(((upCount + warnCount) / devices.length) * 100).toFixed(1) : 100,
        avgLatency,
        overallSla,
        lastProbeTime: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBuildings = (req, res) => {
  try {
    const buildings = db.getBuildings();
    const devices = db.getDevices();

    const data = buildings.map(b => {
      const bldDevices = devices.filter(d => d.buildingId === b.id);
      const bldUp = bldDevices.filter(d => d.status === 'UP').length;
      const bldWarn = bldDevices.filter(d => d.status === 'WARNING').length;
      const bldDown = bldDevices.filter(d => d.status === 'DOWN').length;

      return {
        ...b,
        deviceCount: bldDevices.length,
        upCount: bldUp,
        warnCount: bldWarn,
        downCount: bldDown,
        healthPercentage: bldDevices.length > 0 
          ? Math.round(((bldUp + bldWarn) / bldDevices.length) * 100) 
          : 100
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createBuilding = (req, res) => {
  try {
    const { name, code, location, icon, color } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Nama dan kode gedung wajib diisi' });
    }
    const created = db.addBuilding({ name, code, location, icon, color });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateBuilding = (req, res) => {
  try {
    const updated = db.updateBuilding(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Gedung tidak ditemukan' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteBuilding = (req, res) => {
  try {
    const deleted = db.deleteBuilding(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Gedung tidak ditemukan' });
    }
    res.json({ success: true, message: 'Gedung berhasil dihapus', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createEdge = (req, res) => {
  try {
    const { from, to, label } = req.body;
    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'From dan To node wajib diisi' });
    }
    const created = db.addEdge({ from, to, label });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteEdge = (req, res) => {
  try {
    const { from, to } = req.body;
    const deleted = db.deleteEdge(from, to);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Koneksi topologi tidak ditemukan' });
    }
    res.json({ success: true, message: 'Koneksi berhasil dihapus', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getTopology = (req, res) => {
  try {
    const topology = db.getTopology();
    res.json({ success: true, data: topology });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMetrics = (req, res) => {
  try {
    const count = parseInt(req.query.count, 10) || 25;
    const history = db.getRecentMetrics(count);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSettings = (req, res) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateSettings = (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    // Restart engine jika interval berubah
    if (req.body.intervalSeconds) {
      monitorEngine.restart();
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.testTelegramAlert = async (req, res) => {
  try {
    const testResult = await alertService.sendTestMessage();
    res.json({ success: true, result: testResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.triggerFullScan = async (req, res) => {
  try {
    monitorEngine.runCycle();
    res.json({ success: true, message: 'Putaran pemantauan penuh berhasil dipicu' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleFailoverDemo = async (req, res) => {
  try {
    const devices = db.getDevices();
    const targetDev = devices.find(d => d.id === 'dev-sw-fti-01') || devices[2];
    if (!targetDev) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const isCurrentlyDown = targetDev.status === 'DOWN';
    const newStatus = isCurrentlyDown ? 'UP' : 'DOWN';

    const updated = db.updateDevice(targetDev.id, {
      status: newStatus,
      latency: newStatus === 'DOWN' ? null : 3,
      packetLoss: newStatus === 'DOWN' ? 100 : 0,
      lastChecked: new Date().toISOString()
    });

    if (newStatus === 'DOWN') {
      const incident = db.createIncident({
        deviceId: targetDev.id,
        deviceName: targetDev.name,
        buildingName: 'Gedung FTI & Laboratorium Komputer',
        type: 'DOWN',
        message: 'SIMULASI DEMO: Kabel Fiber Optik Uplink Terputus!'
      });
      alertService.notifyDown(targetDev, incident);
      socketService.broadcastIncidentNew(incident);
    } else {
      const resolved = db.resolveActiveIncident(targetDev.id);
      alertService.notifyRecovery(targetDev, 5);
      if (resolved) socketService.broadcastIncidentResolved(resolved);
    }

    socketService.broadcastDeviceUpdate(updated);

    res.json({
      success: true,
      message: `Simulasi status ${targetDev.name} diubah menjadi ${newStatus}`,
      device: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
