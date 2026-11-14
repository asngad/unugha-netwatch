const bandwidthService = require('../src/services/bandwidthService');

describe('BandwidthService Unit Tests', () => {
  test('getCurrent returns valid 4 ISP telemetry structure', () => {
    const current = bandwidthService.getCurrent();
    expect(current).toBeDefined();
    expect(current.capacityMbps).toBe(1050);
    expect(current.isps).toHaveLength(4);

    const citra = current.isps.find(i => i.id === 'isp-citra');
    const indibiz = current.isps.find(i => i.id === 'isp-indibiz');
    const starlink = current.isps.find(i => i.id === 'isp-starlink');
    const starlite = current.isps.find(i => i.id === 'isp-starlite');

    expect(citra.capacityMbps).toBe(100);
    expect(indibiz.capacityMbps).toBe(200);
    expect(starlink.capacityMbps).toBe(250);
    expect(starlite.capacityMbps).toBe(500);
  });

  test('tick updates bandwidth sample calculation', () => {
    bandwidthService.tick();
    const current = bandwidthService.getCurrent();
    expect(typeof current.downloadMbps).toBe('number');
    expect(typeof current.uploadMbps).toBe('number');
    expect(typeof current.utilizationPercentage).toBe('number');
    expect(current.loadBalancer).toContain('192.168.111.3');
    expect(current.switchRack).toContain('10.26.99.15');
  });
});
