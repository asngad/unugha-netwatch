const diagnosticService = require('../services/diagnosticService');
const hardwareService = require('../services/hardwareService');

exports.ping = async (req, res) => {
  try {
    const { host, count } = req.body;
    if (!host) {
      return res.status(400).json({ success: false, error: 'Target host wajib diisi' });
    }
    const result = await diagnosticService.runPing(host, count || 4);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.traceroute = async (req, res) => {
  try {
    const { target } = req.body;
    if (!target) {
      return res.status(400).json({ success: false, error: 'Target host wajib diisi' });
    }
    const result = await diagnosticService.runTraceroute(target);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getHardware = (req, res) => {
  try {
    const data = hardwareService.getTelemetry();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
