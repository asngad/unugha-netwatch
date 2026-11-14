const db = require('../database/db');

exports.getIncidents = (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const incidents = db.getIncidents(limit);
    res.json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.acknowledgeIncident = (req, res) => {
  try {
    const ack = db.acknowledgeIncident(req.params.id);
    if (!ack) {
      return res.status(404).json({ success: false, error: 'Insiden tidak ditemukan' });
    }
    res.json({ success: true, data: ack });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getIncidentById = (req, res) => {
  try {
    const inc = db.getIncidentById(req.params.id);
    if (!inc) {
      return res.status(404).json({ success: false, error: 'Insiden tidak ditemukan' });
    }
    res.json({ success: true, data: inc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateIncident = (req, res) => {
  try {
    const updated = db.updateIncident(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Insiden tidak ditemukan' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteIncident = (req, res) => {
  try {
    const deleted = db.deleteIncident(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Insiden tidak ditemukan' });
    }
    res.json({ success: true, message: 'Log insiden berhasil dihapus', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
