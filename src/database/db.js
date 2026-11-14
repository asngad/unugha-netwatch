const fs = require('fs');
const config = require('../config/config');
const seeds = require('./seeds');

class Database {
  constructor() {
    this.filePath = config.paths.dbFile;
    this.dirPath = config.paths.dataDir;
    this.data = {
      buildings: [],
      devices: [],
      topologyEdges: [],
      incidents: [],
      metricsHistory: [],
      users: [],
      interfaces: [],
      bandwidthHistory: [],
      settings: {
        intervalSeconds: config.monitoring.intervalSeconds,
        timeoutSeconds: config.monitoring.timeoutSeconds,
        latencyWarningThresholdMs: config.monitoring.latencyWarningThresholdMs,
        telegramEnabled: config.telegram.enabled,
        telegramBotToken: config.telegram.botToken,
        telegramChatId: config.telegram.chatId
      }
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(this.dirPath)) {
        fs.mkdirSync(this.dirPath, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all required collections exist
        if (!this.data.buildings || this.data.buildings.length === 0) {
          this.data.buildings = seeds.buildings;
        }
        if (!this.data.devices || this.data.devices.length === 0) {
          this.data.devices = seeds.devices;
        }
        if (!this.data.topologyEdges) {
          this.data.topologyEdges = seeds.topologyEdges;
        }
        if (!this.data.incidents) {
          this.data.incidents = seeds.initialIncidents;
        }
        if (!this.data.metricsHistory) {
          this.data.metricsHistory = [];
        }
        if (!this.data.users || this.data.users.length === 0) {
          this.data.users = seeds.users;
        }
        if (!this.data.interfaces || this.data.interfaces.length === 0) {
          this.data.interfaces = seeds.interfaces;
        }
        if (!this.data.bandwidthHistory) {
          this.data.bandwidthHistory = [];
        }
      } else {
        // Initial seed
        this.data.buildings = seeds.buildings;
        this.data.devices = seeds.devices;
        this.data.topologyEdges = seeds.topologyEdges;
        this.data.incidents = seeds.initialIncidents;
        this.data.metricsHistory = [];
        this.data.users = seeds.users;
        this.data.interfaces = seeds.interfaces;
        this.data.bandwidthHistory = [];
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, using seeds in-memory:', err);
      this.data.buildings = seeds.buildings;
      this.data.devices = seeds.devices;
      this.data.topologyEdges = seeds.topologyEdges;
      this.data.incidents = seeds.initialIncidents;
      this.data.metricsHistory = [];
      this.data.users = seeds.users;
      this.data.interfaces = seeds.interfaces;
      this.data.bandwidthHistory = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err.message);
    }
  }

  // --- Devices ---
  getDevices() {
    return this.data.devices;
  }

  getDeviceById(id) {
    return this.data.devices.find(d => d.id === id);
  }

  updateDevice(id, updateFields) {
    const idx = this.data.devices.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.devices[idx] = { ...this.data.devices[idx], ...updateFields };
      this.save();
      return this.data.devices[idx];
    }
    return null;
  }

  addDevice(deviceData) {
    const id = deviceData.id || `dev-${Date.now().toString(36)}`;
    const newDevice = {
      id,
      name: deviceData.name || 'Perangkat Baru',
      type: deviceData.type || 'access_point',
      buildingId: deviceData.buildingId || 'bld-rek',
      ip: deviceData.ip || '127.0.0.1',
      displayIp: deviceData.displayIp || deviceData.ip || '192.168.1.100',
      mac: deviceData.mac || '00:00:00:00:00:00',
      protocol: deviceData.protocol || 'icmp',
      status: 'UNKNOWN',
      latency: null,
      packetLoss: 0,
      lastChecked: null,
      uptimePercentage: 100.0,
      locationDescription: deviceData.locationDescription || '',
      isMonitored: deviceData.isMonitored !== false
    };
    this.data.devices.push(newDevice);
    this.save();
    return newDevice;
  }

  deleteDevice(id) {
    const idx = this.data.devices.findIndex(d => d.id === id);
    if (idx !== -1) {
      const deleted = this.data.devices.splice(idx, 1)[0];
      // remove associated edges
      this.data.topologyEdges = this.data.topologyEdges.filter(
        e => e.from !== id && e.to !== id
      );
      this.save();
      return deleted;
    }
    return null;
  }

  // --- Buildings ---
  getBuildings() {
    return this.data.buildings;
  }

  getBuildingById(id) {
    return (this.data.buildings || []).find(b => b.id === id);
  }

  addBuilding(bld) {
    const id = bld.id || `bld-${Date.now().toString(36)}`;
    const newBld = {
      id,
      name: bld.name || 'Gedung Baru',
      code: bld.code || 'BLD',
      icon: bld.icon || 'fa-building',
      location: bld.location || 'Kampus UNUGHA',
      color: bld.color || '#059669'
    };
    this.data.buildings.push(newBld);
    this.save();
    return newBld;
  }

  updateBuilding(id, data) {
    const idx = (this.data.buildings || []).findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.buildings[idx] = { ...this.data.buildings[idx], ...data };
      this.save();
      return this.data.buildings[idx];
    }
    return null;
  }

  deleteBuilding(id) {
    const idx = (this.data.buildings || []).findIndex(b => b.id === id);
    if (idx !== -1) {
      const deleted = this.data.buildings.splice(idx, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }

  // --- Topology ---
  getTopology() {
    return {
      nodes: this.data.devices.map(d => ({
        id: d.id,
        label: d.name,
        type: d.type,
        ip: d.displayIp || d.ip,
        status: d.status,
        latency: d.latency,
        buildingId: d.buildingId
      })),
      edges: this.data.topologyEdges
    };
  }

  // --- Incidents ---
  getIncidents(limit = 50) {
    return [...this.data.incidents]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  createIncident(incident) {
    const newInc = {
      id: `inc-${Date.now()}`,
      deviceId: incident.deviceId,
      deviceName: incident.deviceName,
      buildingName: incident.buildingName || 'Kampus UNUGHA',
      type: incident.type || 'DOWN',
      message: incident.message || 'Perangkat tidak merespon probe',
      startedAt: new Date().toISOString(),
      resolvedAt: null,
      status: 'ACTIVE',
      acknowledged: false
    };
    this.data.incidents.unshift(newInc);
    // keep max 200 incidents
    if (this.data.incidents.length > 200) {
      this.data.incidents = this.data.incidents.slice(0, 200);
    }
    this.save();
    return newInc;
  }

  resolveActiveIncident(deviceId) {
    const activeInc = this.data.incidents.find(
      i => i.deviceId === deviceId && i.status === 'ACTIVE'
    );
    if (activeInc) {
      activeInc.resolvedAt = new Date().toISOString();
      activeInc.status = 'RESOLVED';
      this.save();
      return activeInc;
    }
    return null;
  }

  acknowledgeIncident(id) {
    const inc = this.data.incidents.find(i => i.id === id);
    if (inc) {
      inc.acknowledged = true;
      this.save();
      return inc;
    }
    return null;
  }

  getIncidentById(id) {
    return (this.data.incidents || []).find(i => i.id === id);
  }

  updateIncident(id, data) {
    const idx = (this.data.incidents || []).findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data.incidents[idx] = { ...this.data.incidents[idx], ...data };
      this.save();
      return this.data.incidents[idx];
    }
    return null;
  }

  deleteIncident(id) {
    const idx = (this.data.incidents || []).findIndex(i => i.id === id);
    if (idx !== -1) {
      const deleted = this.data.incidents.splice(idx, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }

  // --- Metrics History (for Chart.js live charts) ---
  addMetric(metric) {
    this.data.metricsHistory.push({
      timestamp: new Date().toISOString(),
      ...metric
    });
    // keep last 500 samples
    if (this.data.metricsHistory.length > 500) {
      this.data.metricsHistory.shift();
    }
  }

  getRecentMetrics(count = 20) {
    return this.data.metricsHistory.slice(-count);
  }

  // --- Settings ---
  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // --- Users & RBAC ---
  getUsers() {
    return this.data.users || [];
  }

  getUserById(id) {
    return (this.data.users || []).find(u => u.id === id);
  }

  getUserByUsername(username) {
    return (this.data.users || []).find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  addUser(userData) {
    const id = userData.id || `usr-${Date.now().toString(36)}`;
    const newUser = {
      id,
      username: (userData.username || 'user').toLowerCase(),
      name: userData.name || 'Pengguna Baru',
      role: userData.role || 'TEKNISI',
      email: userData.email || 'user@unugha.ac.id',
      avatar: userData.avatar || (userData.role === 'ADMIN_NOC' ? 'fa-user-shield' : 'fa-user-gear')
    };
    if (!this.data.users) this.data.users = [];
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, data) {
    const idx = (this.data.users || []).findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...data };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  deleteUser(id) {
    const idx = (this.data.users || []).findIndex(u => u.id === id);
    if (idx !== -1) {
      const deleted = this.data.users.splice(idx, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }

  // --- Topology Edges CRUD ---
  addEdge(edgeData) {
    if (!this.data.topologyEdges) this.data.topologyEdges = [];
    const edge = {
      from: edgeData.from,
      to: edgeData.to,
      label: edgeData.label || 'Koneksi Jaringan'
    };
    this.data.topologyEdges.push(edge);
    this.save();
    return edge;
  }

  deleteEdge(from, to) {
    if (!this.data.topologyEdges) return null;
    const idx = this.data.topologyEdges.findIndex(e => e.from === from && e.to === to);
    if (idx !== -1) {
      const deleted = this.data.topologyEdges.splice(idx, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }

  // --- Bandwidth Telemetry ---
  getInterfaces() {
    return this.data.interfaces || [];
  }

  addBandwidthSample(sample) {
    if (!this.data.bandwidthHistory) this.data.bandwidthHistory = [];
    this.data.bandwidthHistory.push({
      timestamp: new Date().toISOString(),
      ...sample
    });
    if (this.data.bandwidthHistory.length > 300) {
      this.data.bandwidthHistory.shift();
    }
  }

  getRecentBandwidth(count = 20) {
    return (this.data.bandwidthHistory || []).slice(-count);
  }

  // --- SLA & Executive Report Data ---
  getSlaReport() {
    const buildings = this.getBuildings();
    const devices = this.getDevices();
    const incidents = this.getIncidents(100);

    const buildingReports = buildings.map(bld => {
      const bldDevices = devices.filter(d => d.buildingId === bld.id);
      const bldIncidents = incidents.filter(i => {
        const d = devices.find(dev => dev.id === i.deviceId);
        return d && d.buildingId === bld.id;
      });

      const avgUptime = bldDevices.length > 0
        ? +(bldDevices.reduce((acc, d) => acc + (d.uptimePercentage || 99.0), 0) / bldDevices.length).toFixed(2)
        : 99.9;

      let totalDowntimeMinutes = 0;
      bldIncidents.forEach(inc => {
        const start = new Date(inc.startedAt).getTime();
        const end = inc.resolvedAt ? new Date(inc.resolvedAt).getTime() : Date.now();
        totalDowntimeMinutes += Math.max(1, Math.round((end - start) / 60000));
      });

      const mttr = bldIncidents.length > 0
        ? Math.round(totalDowntimeMinutes / bldIncidents.length)
        : 0;

      return {
        buildingId: bld.id,
        buildingName: bld.name,
        buildingCode: bld.code,
        deviceCount: bldDevices.length,
        uptimePercentage: avgUptime,
        incidentCount: bldIncidents.length,
        totalDowntimeMinutes,
        mttrMinutes: mttr
      };
    });

    const totalDevices = devices.length;
    const overallSla = devices.length > 0
      ? +(devices.reduce((acc, d) => acc + (d.uptimePercentage || 99.0), 0) / devices.length).toFixed(2)
      : 99.8;

    return {
      campus: config.campus.name,
      period: 'Bulan Berjalan (30 Hari Terakhir)',
      generatedAt: new Date().toISOString(),
      overallSla,
      totalDevices,
      totalIncidents: incidents.length,
      activeIncidents: incidents.filter(i => i.status === 'ACTIVE').length,
      buildingReports,
      recentIncidents: incidents.slice(0, 10)
    };
  }
}

module.exports = new Database();
