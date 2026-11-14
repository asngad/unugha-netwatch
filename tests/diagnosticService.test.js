const diagnosticService = require('../src/services/diagnosticService');

describe('DiagnosticService Unit Tests', () => {
  test('runPing returns valid ping statistics structure', async () => {
    const res = await diagnosticService.runPing('127.0.0.1', 2);
    expect(res).toBeDefined();
    expect(res.host).toBe('127.0.0.1');
    expect(Array.isArray(res.outputLines)).toBe(true);
    expect(typeof res.packetLossPercent).toBe('number');
    expect(typeof res.avgLatencyMs).toBe('number');
  });

  test('runTraceroute internal UNUGHA AP 10.27.51.12 returns 3 hops via EG1510XS and SW Rack', async () => {
    const res = await diagnosticService.runTraceroute('10.27.51.12');
    expect(res.target).toBe('10.27.51.12');
    expect(res.hops).toBe(3);
    const text = res.outputLines.join('\n');
    expect(text).toContain('192.168.111.3');
    expect(text).toContain('10.26.99.15');
    expect(text).toContain('OpenWrt_GH1LT1 EA7500');
  });

  test('runTraceroute to Core Load Balancer 192.168.111.3 returns 1 hop', async () => {
    const res = await diagnosticService.runTraceroute('192.168.111.3');
    expect(res.hops).toBe(1);
    expect(res.outputLines.some(l => l.includes('192.168.111.3'))).toBe(true);
  });

  test('runTraceroute to Mikrotik SW Rack 10.26.99.15 returns 2 hops', async () => {
    const res = await diagnosticService.runTraceroute('10.26.99.15');
    expect(res.hops).toBe(2);
    expect(res.outputLines.some(l => l.includes('10.26.99.15'))).toBe(true);
  });

  test('runTraceroute external target returns 5 hops through Multi-WAN gateway', async () => {
    const res = await diagnosticService.runTraceroute('google.com');
    expect(res.target).toBe('google.com');
    expect(res.hops).toBe(5);
    const text = res.outputLines.join('\n');
    expect(text).toContain('Multi-WAN');
    expect(text).toContain('Telkom Regional IV');
    expect(text).toContain('Jakarta Core Internet Exchange');
  });
});
