const hardwareService = require('../src/services/hardwareService');

describe('HardwareService Unit Tests', () => {
  test('getTelemetry returns EG1510XS, Mikrotik SW Rack, and AP fleet metrics', () => {
    const data = hardwareService.getTelemetry();
    expect(data).toBeDefined();

    expect(data.loadBalancer).toBeDefined();
    expect(data.loadBalancer.model).toContain('EG1510XS');
    expect(data.loadBalancer.ip).toBe('192.168.111.3');
    expect(typeof data.loadBalancer.cpuLoad).toBe('number');
    expect(typeof data.loadBalancer.ramUsage).toBe('number');
    expect(typeof data.loadBalancer.temperatureC).toBe('number');

    expect(data.switchRack).toBeDefined();
    expect(data.switchRack.ip).toBe('10.26.99.15');
    expect(typeof data.switchRack.cpuLoad).toBe('number');

    expect(data.apFleet).toBeDefined();
    expect(data.apFleet.totalUnits).toBe(16);
    expect(typeof data.apFleet.totalClientsConnected).toBe('number');
  });

  test('tick updates telemetry fluctuations', () => {
    hardwareService.tick();
    const data = hardwareService.getTelemetry();
    expect(typeof data.loadBalancer.cpuLoad).toBe('number');
    expect(typeof data.switchRack.cpuLoad).toBe('number');
  });
});
