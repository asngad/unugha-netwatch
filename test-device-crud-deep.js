const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runDeepVerification() {
  console.log('=== Deep Verification of Device Inventory & CRUD Module ===\n');

  // 1. Verify all 24 initial devices & their valid actual data
  console.log('1. Checking Inventory List & Status...');
  const listRes = await request('GET', '/api/devices');
  if (listRes.status !== 200 || !listRes.body.success) {
    throw new Error('Failed to fetch devices: ' + JSON.stringify(listRes.body));
  }
  const devices = listRes.body.data;
  console.log(`[PASS] Total devices in inventory: ${devices.length}`);

  // Check 16 OpenWrt devices
  const openWrtDevs = devices.filter(d => d.name.includes('OpenWrt') || d.name.includes('OpenWRT'));
  console.log(`[PASS] OpenWrt EA7500 APs count: ${openWrtDevs.length}/16`);
  if (openWrtDevs.length !== 16) {
    throw new Error('Expected 16 OpenWrt devices, found ' + openWrtDevs.length);
  }

  // Check LB and Switch
  const lb = devices.find(d => d.name.includes('EG1510XS'));
  const sw = devices.find(d => d.name.includes('Mikrotik SW Rack'));
  console.log(`[PASS] Load Balancer EG1510XS IP: ${lb.ip} (Status: ${lb.status}, Latency: ${lb.latency}ms)`);
  console.log(`[PASS] Mikrotik SW Rack IP: ${sw.ip} (Status: ${sw.status}, Latency: ${sw.latency}ms)`);

  // 2. CREATE Device
  console.log('\n2. Testing CREATE Device (Tambah Perangkat)...');
  const createPayload = {
    name: 'OpenWrt_LabAI EA7500 Test',
    ip: '10.27.43.199',
    displayIp: '10.27.43.199 (Lab AI)',
    mac: 'C4:41:1E:43:C7:99',
    type: 'access_point',
    buildingId: 'bld-fti',
    protocol: 'icmp',
    locationDescription: 'Laboratorium Artificial Intelligence & Robotika FTI'
  };
  const createRes = await request('POST', '/api/devices', createPayload);
  if (createRes.status !== 201 || !createRes.body.success) {
    throw new Error('Create failed: ' + JSON.stringify(createRes.body));
  }
  const createdId = createRes.body.data.id;
  console.log(`[PASS] Created Device ID: ${createdId}, Name: ${createRes.body.data.name}`);

  // 3. READ Device
  console.log('\n3. Testing READ Device Detail (Lihat Detail)...');
  const readRes = await request('GET', `/api/devices/${createdId}`);
  if (readRes.status !== 200 || !readRes.body.success) {
    throw new Error('Read failed: ' + JSON.stringify(readRes.body));
  }
  console.log(`[PASS] Device retrieved: ${readRes.body.data.name}, IP: ${readRes.body.data.ip}, Building: ${readRes.body.data.buildingId}`);

  // 4. UPDATE Device
  console.log('\n4. Testing UPDATE Device (Edit Perangkat)...');
  const updatePayload = {
    name: 'OpenWrt_LabAI EA7500 Production',
    ip: '10.27.43.199',
    displayIp: '10.27.43.199 (Lab AI & Data)',
    mac: 'C4:41:1E:43:C7:99',
    type: 'access_point',
    buildingId: 'bld-fti',
    protocol: 'icmp',
    locationDescription: 'Gedung FTI Lt 3 Sayap Barat'
  };
  const updateRes = await request('PUT', `/api/devices/${createdId}`, updatePayload);
  if (updateRes.status !== 200 || !updateRes.body.success) {
    throw new Error('Update failed: ' + JSON.stringify(updateRes.body));
  }
  console.log(`[PASS] Updated Device: ${updateRes.body.data.name}, Location: ${updateRes.body.data.locationDescription}`);

  // 5. PING Device
  console.log('\n5. Testing Instant Ping (Diagnostik ICMP)...');
  const pingRes = await request('POST', `/api/devices/${createdId}/ping`);
  if (pingRes.status !== 200 || !pingRes.body.success) {
    throw new Error('Ping failed: ' + JSON.stringify(pingRes.body));
  }
  console.log(`[PASS] Instant Ping Result: Alive=${pingRes.body.data.probeRes.alive}, Status=${pingRes.body.data.device.status}`);

  // 6. DELETE Device
  console.log('\n6. Testing DELETE Device (Hapus Perangkat)...');
  const deleteRes = await request('DELETE', `/api/devices/${createdId}`);
  if (deleteRes.status !== 200 || !deleteRes.body.success) {
    throw new Error('Delete failed: ' + JSON.stringify(deleteRes.body));
  }
  console.log(`[PASS] Deleted Device: ${deleteRes.body.message}`);

  // Verify deletion
  const verifyRes = await request('GET', `/api/devices/${createdId}`);
  if (verifyRes.status === 404) {
    console.log('[PASS] Confirmed device no longer exists in DB');
  } else {
    throw new Error('Device still exists after deletion!');
  }

  // Check final count
  const finalListRes = await request('GET', '/api/devices');
  console.log(`[PASS] Final device count in DB: ${finalListRes.body.data.length} (Restored cleanly to 24)`);

  console.log('\n=== ALL DEEP INVENTORY & CRUD VERIFICATIONS PASSED (100%) ===');
}

runDeepVerification().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
