const alertService = require('../src/services/alertService');

describe('AlertService Unit Tests', () => {
  const dummyDevice = {
    id: 'test-dev-001',
    name: 'OpenWrt_Test_AP',
    displayIp: '10.27.51.99',
    ip: '10.27.51.99',
    latency: 12
  };

  const dummyIncident = {
    id: 'inc-test-001',
    deviceId: dummyDevice.id,
    deviceName: dummyDevice.name,
    buildingName: 'Gedung Rektorat',
    message: 'Perangkat tidak merespon probe ICMP'
  };

  test('notifyDown triggers telegram notification or simulation', async () => {
    const res = await alertService.notifyDown(dummyDevice, dummyIncident);
    expect(res).toBeDefined();
    // either simulated or response object
    expect(typeof res).toBe('object');
  });

  test('notifyDown enforces anti-spam throttling for consecutive alerts', async () => {
    const res = await alertService.notifyDown(dummyDevice, dummyIncident);
    expect(res.skipped).toBe(true);
    expect(res.reason).toContain('Throttled');
  });

  test('notifyRecovery sends recovery message and resets alert throttling', async () => {
    const res = await alertService.notifyRecovery(dummyDevice, 5);
    expect(res).toBeDefined();
    expect(alertService.lastAlertTimestamps.has(dummyDevice.id)).toBe(false);
  });
});
