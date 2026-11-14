// Complete CRUD Test suite for UNUGHA NetWatch
async function runAllTests() {
  const BASE = 'http://localhost:3000';
  const results = [];

  async function test(name, fn) {
    try {
      const res = await fn();
      results.push({ name, status: 'PASS', details: res });
      console.log(`[PASS] ${name}`);
    } catch (err) {
      results.push({ name, status: 'FAIL', error: err.message });
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  console.log('--- Starting Complete CRUD & Module Verification Suite ---\n');

  // 1. Static Assets
  await test('UI: Dashboard HTML & Assets', async () => {
    const r = await fetch(`${BASE}/`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const text = await r.text();
    if (!text.includes('UNUGHA NetWatch')) throw new Error('Missing brand title');
    return 'HTML Loaded OK';
  });

  // 2. Auth & User Management CRUD
  let authToken = '';
  await test('Auth: Login as Admin', async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'adminunugha' })
    });
    const data = await r.json();
    if (!data.success || !data.token) throw new Error(data.error || 'No token');
    authToken = data.token;
    return `Logged in as ${data.user.name}`;
  });

  let testUserId = '';
  await test('User CRUD: Create User', async () => {
    const r = await fetch(`${BASE}/api/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `teknisi_test_${Date.now()}`,
        name: 'Teknisi Magang UNUGHA',
        role: 'TEKNISI',
        email: 'magang@unugha.ac.id'
      })
    });
    const data = await r.json();
    if (!data.success || !data.data.id) throw new Error(data.error || 'Create user failed');
    testUserId = data.data.id;
    return `Created user ID: ${testUserId}`;
  });

  await test('User CRUD: Update User', async () => {
    const r = await fetch(`${BASE}/api/auth/users/${testUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Teknisi Senior UNUGHA' })
    });
    const data = await r.json();
    if (!data.success || data.data.name !== 'Teknisi Senior UNUGHA') throw new Error('Update user failed');
    return `Updated user name to: ${data.data.name}`;
  });

  await test('User CRUD: Delete User', async () => {
    const r = await fetch(`${BASE}/api/auth/users/${testUserId}`, { method: 'DELETE' });
    const data = await r.json();
    if (!data.success) throw new Error('Delete user failed');
    return `Deleted user: ${testUserId}`;
  });

  // 3. Building Management CRUD
  let testBldId = '';
  await test('Building CRUD: Create Building', async () => {
    const r = await fetch(`${BASE}/api/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Gedung R&D Laboratorium AI',
        code: 'LAB-AI',
        location: 'Sayap Utara Kampus',
        color: '#2563eb',
        icon: 'fa-microchip'
      })
    });
    const data = await r.json();
    if (!data.success || !data.data.id) throw new Error(data.error || 'Create building failed');
    testBldId = data.data.id;
    return `Created building ID: ${testBldId}`;
  });

  await test('Building CRUD: Update Building', async () => {
    const r = await fetch(`${BASE}/api/buildings/${testBldId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: 'Gedung Riset Lantai 3' })
    });
    const data = await r.json();
    if (!data.success || data.data.location !== 'Gedung Riset Lantai 3') throw new Error('Update building failed');
    return `Updated location: ${data.data.location}`;
  });

  await test('Building CRUD: Delete Building', async () => {
    const r = await fetch(`${BASE}/api/buildings/${testBldId}`, { method: 'DELETE' });
    const data = await r.json();
    if (!data.success) throw new Error('Delete building failed');
    return `Deleted building: ${testBldId}`;
  });

  // 4. Device Management CRUD
  let testDevId = '';
  await test('Device CRUD: Create Device', async () => {
    const r = await fetch(`${BASE}/api/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'AP-Ruang-Sidang-Senat',
        type: 'access_point',
        buildingId: 'bld-rek',
        ip: '127.0.0.1',
        displayIp: '192.168.1.55',
        protocol: 'icmp',
        locationDescription: 'Ruang Rapat Senat Lt. 2'
      })
    });
    const data = await r.json();
    if (!data.success || !data.data.id) throw new Error(data.error || 'Create device failed');
    testDevId = data.data.id;
    return `Created device: ${testDevId}`;
  });

  await test('Device CRUD: View (Read) Device Detail', async () => {
    const r = await fetch(`${BASE}/api/devices/${testDevId}`);
    const data = await r.json();
    if (!data.success || data.data.id !== testDevId) throw new Error('Read device failed');
    return `Fetched: ${data.data.name} (${data.data.ip})`;
  });

  await test('Device CRUD: Edit (Update) Device', async () => {
    const r = await fetch(`${BASE}/api/devices/${testDevId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'AP-Ruang-Sidang-Senat-Updated' })
    });
    const data = await r.json();
    if (!data.success || data.data.name !== 'AP-Ruang-Sidang-Senat-Updated') throw new Error('Update device failed');
    return `Updated name to: ${data.data.name}`;
  });

  await test('Device CRUD: Instant Diagnostic Ping', async () => {
    const r = await fetch(`${BASE}/api/devices/${testDevId}/ping`, { method: 'POST' });
    const data = await r.json();
    if (!data.success || !data.data.probeRes) throw new Error('Ping failed');
    return `Ping result: Alive=${data.data.probeRes.alive}, Latency=${data.data.probeRes.latency}ms`;
  });

  await test('Device CRUD: Delete Device', async () => {
    const r = await fetch(`${BASE}/api/devices/${testDevId}`, { method: 'DELETE' });
    const data = await r.json();
    if (!data.success) throw new Error('Delete device failed');
    return `Deleted device: ${testDevId}`;
  });

  // 5. Incident Management CRUD
  let testIncId = '';
  await test('Incident CRUD: Read Incidents', async () => {
    const r = await fetch(`${BASE}/api/incidents`);
    const data = await r.json();
    if (!data.success || !Array.isArray(data.data)) throw new Error('Read incidents failed');
    if (data.data.length > 0) testIncId = data.data[0].id;
    return `Total incidents: ${data.data.length}`;
  });

  if (testIncId) {
    await test('Incident CRUD: View Incident Detail', async () => {
      const r = await fetch(`${BASE}/api/incidents/${testIncId}`);
      const data = await r.json();
      if (!data.success || data.data.id !== testIncId) throw new Error('Read incident detail failed');
      return `Incident: ${data.data.deviceName} - ${data.data.status}`;
    });

    await test('Incident CRUD: Update Incident Notes', async () => {
      const r = await fetch(`${BASE}/api/incidents/${testIncId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Sedang diperiksa oleh teknisi shift malam' })
      });
      const data = await r.json();
      if (!data.success) throw new Error('Update incident failed');
      return `Updated incident notes`;
    });
  }

  // 6. Reports & Telemetry Modules
  await test('Reports: SLA Executive Data', async () => {
    const r = await fetch(`${BASE}/api/reports/sla`);
    const data = await r.json();
    if (!data.success) throw new Error('SLA report error');
    return `Overall SLA: ${data.data.overallSla}%`;
  });

  await test('Reports: CSV Export', async () => {
    const r = await fetch(`${BASE}/api/reports/export/csv`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return 'CSV downloaded successfully';
  });

  await test('Bandwidth & Hardware Telemetry', async () => {
    const [rBw, rHw] = await Promise.all([
      fetch(`${BASE}/api/bandwidth`).then(r => r.json()),
      fetch(`${BASE}/api/hardware`).then(r => r.json())
    ]);
    if (!rBw.success || !rHw.success) throw new Error('Telemetry failed');
    return `Down: ${rBw.data.current.downloadMbps} Mbps | Router: ${rHw.data.router.temperatureC}°C`;
  });

  // 7. Diagnostics Terminal
  await test('Diagnostics: Web Terminal Ping & Trace', async () => {
    const [rPing, rTrace] = await Promise.all([
      fetch(`${BASE}/api/diagnostics/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: '127.0.0.1', count: 2 })
      }).then(r => r.json()),
      fetch(`${BASE}/api/diagnostics/traceroute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'unugha.ac.id' })
      }).then(r => r.json())
    ]);
    if (!rPing.success || !rTrace.success) throw new Error('Diagnostics failed');
    return `Ping lines: ${rPing.data.outputLines.length}, Trace hops: ${rTrace.data.hops}`;
  });

  console.log('\n--- Full CRUD Verification Summary ---');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`TOTAL TESTS: ${results.length}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runAllTests().catch(e => {
  console.error('Test Runner Exception:', e);
  process.exit(1);
});
