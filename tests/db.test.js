const db = require('../src/database/db');

describe('Database (db.js) Unit Tests', () => {
  let createdDevId;
  let createdBldId;
  let createdUserId;

  test('getDevices returns array of devices including 16 APs, EG1510XS, and SW Rack', () => {
    const devices = db.getDevices();
    expect(Array.isArray(devices)).toBe(true);
    expect(devices.length).toBeGreaterThanOrEqual(24);

    const lb = devices.find(d => d.ip === '192.168.111.3');
    const sw = devices.find(d => d.ip === '10.26.99.15');
    expect(lb).toBeDefined();
    expect(sw).toBeDefined();
  });

  test('addDevice, updateDevice, getDeviceById, and deleteDevice CRUD cycle', () => {
    const newDev = db.addDevice({
      name: 'Test Device Unit',
      type: 'access_point',
      ip: '10.27.99.99',
      displayIp: '10.27.99.99',
      buildingId: 'bld-rek'
    });
    expect(newDev).toBeDefined();
    expect(newDev.id).toBeDefined();
    createdDevId = newDev.id;

    const fetched = db.getDeviceById(createdDevId);
    expect(fetched.name).toBe('Test Device Unit');

    const updated = db.updateDevice(createdDevId, { name: 'Test Device Updated' });
    expect(updated.name).toBe('Test Device Updated');

    const deleted = db.deleteDevice(createdDevId);
    expect(deleted.id).toBe(createdDevId);
    expect(db.getDeviceById(createdDevId)).toBeUndefined();
  });

  test('Building CRUD operations', () => {
    const newBld = db.addBuilding({
      name: 'Gedung Uji Unit',
      code: 'TEST-BLD',
      location: 'Area Test'
    });
    expect(newBld).toBeDefined();
    createdBldId = newBld.id;

    const bld = db.getBuildingById(createdBldId);
    expect(bld.code).toBe('TEST-BLD');

    db.updateBuilding(createdBldId, { name: 'Gedung Uji Updated' });
    expect(db.getBuildingById(createdBldId).name).toBe('Gedung Uji Updated');

    db.deleteBuilding(createdBldId);
    expect(db.getBuildingById(createdBldId)).toBeUndefined();
  });

  test('User CRUD operations and credentials verification', () => {
    const newUser = db.addUser({
      username: 'testuser_unit',
      name: 'User Unit Test',
      role: 'TEKNISI',
      email: 'test@unugha.ac.id',
      password: 'testpassword123'
    });
    expect(newUser).toBeDefined();
    createdUserId = newUser.id;

    const found = db.getUserByUsername('testuser_unit');
    expect(found).toBeDefined();
    expect(found.role).toBe('TEKNISI');

    db.updateUser(createdUserId, { name: 'User Unit Renamed' });
    expect(db.getUserById(createdUserId).name).toBe('User Unit Renamed');

    db.deleteUser(createdUserId);
    expect(db.getUserById(createdUserId)).toBeUndefined();
  });

  test('Incident lifecycle and SLA report generation', () => {
    const inc = db.createIncident({
      deviceId: 'dev-lb-eg1510xs',
      deviceName: 'Load Balancer EG1510XS',
      buildingName: 'NOC Rektorat',
      message: 'Uji Gangguan Unit'
    });
    expect(inc).toBeDefined();
    expect(inc.status).toBe('ACTIVE');

    const resolved = db.resolveActiveIncident('dev-lb-eg1510xs');
    expect(resolved).toBeDefined();
    expect(resolved.status).toBe('RESOLVED');

    const sla = db.getSlaReport();
    expect(sla).toBeDefined();
    expect(typeof sla.overallSla).toBe('number');
    expect(Array.isArray(sla.buildingReports)).toBe(true);

    db.deleteIncident(inc.id);
  });

  test('Settings read and update', () => {
    const initialSettings = db.getSettings();
    expect(initialSettings).toBeDefined();
    expect(typeof initialSettings.intervalSeconds).toBe('number');

    const updated = db.updateSettings({ timeoutSeconds: 3 });
    expect(updated.timeoutSeconds).toBe(3);
  });
});
