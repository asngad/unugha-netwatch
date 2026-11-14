const express = require('express');
const router = express.Router();

const deviceController = require('../controllers/deviceController');
const incidentController = require('../controllers/incidentController');
const statController = require('../controllers/statController');
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const diagnosticController = require('../controllers/diagnosticController');

// Autentikasi & Pengguna (RBAC CRUD)
router.post('/auth/login', authController.login);
router.get('/auth/me', authController.getCurrentUser);
router.get('/auth/users', authController.getUsers);
router.post('/auth/users', authController.createUser);
router.put('/auth/users/:id', authController.updateUser);
router.delete('/auth/users/:id', authController.deleteUser);

// Devices (CRUD)
router.get('/devices', deviceController.getAllDevices);
router.get('/devices/:id', deviceController.getDeviceById);
router.post('/devices', deviceController.createDevice);
router.put('/devices/:id', deviceController.updateDevice);
router.delete('/devices/:id', deviceController.deleteDevice);
router.post('/devices/:id/ping', deviceController.pingDeviceNow);

// Incidents (CRUD)
router.get('/incidents', incidentController.getIncidents);
router.get('/incidents/:id', incidentController.getIncidentById);
router.put('/incidents/:id', incidentController.updateIncident);
router.delete('/incidents/:id', incidentController.deleteIncident);
router.post('/incidents/:id/acknowledge', incidentController.acknowledgeIncident);

// Statistics, Topology, & Buildings (CRUD)
router.get('/stats', statController.getSummaryStats);
router.get('/buildings', statController.getBuildings);
router.post('/buildings', statController.createBuilding);
router.put('/buildings/:id', statController.updateBuilding);
router.delete('/buildings/:id', statController.deleteBuilding);

router.get('/topology', statController.getTopology);
router.post('/topology/edges', statController.createEdge);
router.delete('/topology/edges', statController.deleteEdge);

router.get('/metrics', statController.getMetrics);
router.post('/scan', statController.triggerFullScan);
router.post('/demo/toggle-failover', statController.toggleFailoverDemo);

// Bandwidth Monitoring & Laporan SLA
router.get('/bandwidth', reportController.getBandwidth);
router.get('/reports/sla', reportController.getSlaReport);
router.get('/reports/export/csv', reportController.exportCsv);

// Diagnostic Tools & Hardware Resources
router.post('/diagnostics/ping', diagnosticController.ping);
router.post('/diagnostics/traceroute', diagnosticController.traceroute);
router.get('/hardware', diagnosticController.getHardware);

// Mobile APK Download
const path = require('path');
const fs = require('fs');
router.get('/download/apk', (req, res) => {
  const apkPath = path.join(__dirname, '../../public/downloads/unugha-netwatch-release.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="UNUGHA-NetWatch-v1.2.apk"');
    return res.sendFile(apkPath);
  }
  res.status(404).json({ success: false, error: 'Berkas APK belum siap diunduh' });
});

// Settings & Testing
router.get('/settings', statController.getSettings);
router.put('/settings', statController.updateSettings);
router.post('/test/telegram', statController.testTelegramAlert);

module.exports = router;
