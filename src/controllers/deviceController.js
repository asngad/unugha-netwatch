const db = require('../database/db');
const monitorEngine = require('../services/monitorEngine');

exports.getAllDevices = (req, res) => {
  try {
    const devices = db.getDevices();
    const buildings = db.getBuildings();

    // Map building name to device
    const enriched = devices.map(d => {
      const b = buildings.find(bld => bld.id === d.buildingId);
      return {
        ...d,
        buildingName: b ? b.name : 'Unknown',
        buildingCode: b ? b.code : 'N/A'
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDeviceById = (req, res) => {
  try {
    const device = db.getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Perangkat tidak ditemukan' });
    }
    res.json({ success: true, data: device });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createDevice = (req, res) => {
  try {
    const { name, type, buildingId, ip, displayIp, mac, protocol, locationDescription } = req.body;
    if (!name || !ip) {
      return res.status(400).json({ success: false, error: 'Nama dan IP wajib diisi' });
    }

    const newDevice = db.addDevice({
      name,
      type: type || 'access_point',
      buildingId: buildingId || 'bld-rek',
      ip,
      displayIp: displayIp || ip,
      mac: mac || '00:00:00:00:00:00',
      protocol: protocol || 'icmp',
      locationDescription: locationDescription || ''
    });

    // Jalankan probe instan agar status langsung terdeteksi
    monitorEngine.probeSingle(newDevice.id).catch(() => {});

    res.status(201).json({ success: true, data: newDevice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateDevice = (req, res) => {
  try {
    const updated = db.updateDevice(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Perangkat tidak ditemukan' });
    }

    // Jalankan probe instan untuk mengecek status IP terbaru
    monitorEngine.probeSingle(req.params.id).catch(() => {});

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteDevice = (req, res) => {
  try {
    const deleted = db.deleteDevice(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Perangkat tidak ditemukan' });
    }
    res.json({ success: true, message: 'Perangkat berhasil dihapus', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.pingDeviceNow = async (req, res) => {
  try {
    const result = await monitorEngine.probeSingle(req.params.id);
    if (result.error) {
      return res.status(404).json({ success: false, error: result.error });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
