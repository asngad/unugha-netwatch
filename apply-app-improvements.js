const fs = require('fs');
const path = 'C:/monitoring_unugha/public/js/app.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update deleteDevice
const oldDeleteDevice = /async function deleteDevice\(id\) \{[\s\S]*?\}\r?\n\r?\n\/\/ User RBAC/m;
const newDeleteDevice = `async function deleteDevice(id) {
  if (currentUser.role !== 'ADMIN_NOC') {
    showToast('Hanya Admin NOC yang berhak menghapus perangkat!', 'danger');
    return;
  }
  const d = currentDevices.find(dev => dev.id === id);
  const name = d ? d.name : id;
  if (!confirm(\`Yakin ingin menghapus perangkat "\${name}" dari sistem pemantauan UNUGHA?\`)) return;
  try {
    const res = await fetch(\`/api/devices/\${id}\`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) {
      showToast(\`Perangkat "\${name}" berhasil dihapus dari pemantauan\`, 'success');
      loadAllData();
    } else {
      showToast(res.error || 'Gagal menghapus perangkat', 'danger');
    }
  } catch (e) {
    showToast('Gagal menghapus perangkat', 'danger');
  }
}

// User RBAC`;

if (oldDeleteDevice.test(content)) {
  content = content.replace(oldDeleteDevice, newDeleteDevice);
  console.log('Updated deleteDevice');
} else {
  console.log('oldDeleteDevice pattern not matched');
}

// 2. Update form-add-device payload
const oldAddPayload = /const payload = \{\r?\n\s+name: document\.getElementById\('add-name'\)\.value,[\s\S]*?locationDescription: document\.getElementById\('add-location'\)\.value\r?\n\s+\};/;
const newAddPayload = `const payload = {
      name: document.getElementById('add-name').value.trim(),
      ip: document.getElementById('add-ip').value.trim(),
      displayIp: (document.getElementById('add-display-ip')?.value || '').trim() || document.getElementById('add-ip').value.trim(),
      mac: (document.getElementById('add-mac')?.value || '').trim() || '00:00:00:00:00:00',
      type: document.getElementById('add-type').value,
      buildingId: document.getElementById('add-building').value,
      protocol: document.getElementById('add-protocol').value,
      locationDescription: (document.getElementById('add-location')?.value || '').trim()
    };`;

if (oldAddPayload.test(content)) {
  content = content.replace(oldAddPayload, newAddPayload);
  console.log('Updated form-add-device payload');
} else {
  console.log('oldAddPayload pattern not matched');
}

// 3. Update applyTableFilters and populateBuildingSelect
const oldFilters = /function applyTableFilters\(\) \{[\s\S]*?function populateSettings/m;
const newFilters = `function applyTableFilters() {
  const query = (document.getElementById('search-device')?.value || '').toLowerCase().trim();
  const bld = document.getElementById('filter-building')?.value || '';
  const status = document.getElementById('filter-status')?.value || '';

  const filtered = currentDevices.filter(d => {
    const matchQuery = !query || 
      (d.name && d.name.toLowerCase().includes(query)) || 
      (d.ip && d.ip.toLowerCase().includes(query)) || 
      (d.displayIp && d.displayIp.toLowerCase().includes(query)) ||
      (d.mac && d.mac.toLowerCase().includes(query)) ||
      (d.locationDescription && d.locationDescription.toLowerCase().includes(query));
    const matchBld = !bld || d.buildingId === bld;
    const matchStatus = !status || d.status === status;
    return matchQuery && matchBld && matchStatus;
  });

  const countBadge = document.getElementById('table-device-count');
  if (countBadge) {
    countBadge.textContent = \`\${filtered.length} Perangkat\`;
  }

  renderDevicesTable(filtered);
}

function resetTableFilters() {
  const sInput = document.getElementById('search-device');
  const bSelect = document.getElementById('filter-building');
  const stSelect = document.getElementById('filter-status');
  if (sInput) sInput.value = '';
  if (bSelect) bSelect.value = '';
  if (stSelect) stSelect.value = '';
  applyTableFilters();
  showToast('Filter pencarian berhasil direset', 'info');
}
window.resetTableFilters = resetTableFilters;

function populateBuildingSelect(buildings) {
  const selectFilter = document.getElementById('filter-building');
  const selectAdd = document.getElementById('add-building');
  const selectEdit = document.getElementById('edit-dev-building');

  if (selectFilter) {
    selectFilter.innerHTML = '<option value="">Semua Gedung Kampus</option>' + 
      buildings.map(b => \`<option value="\${b.id}">\${b.name}</option>\`).join('');
  }

  const optionsHtml = buildings.map(b => \`<option value="\${b.id}">\${b.name}</option>\`).join('');
  if (selectAdd) selectAdd.innerHTML = optionsHtml;
  if (selectEdit) selectEdit.innerHTML = optionsHtml;
}

function populateSettings`;

if (oldFilters.test(content)) {
  content = content.replace(oldFilters, newFilters);
  console.log('Updated applyTableFilters and populateBuildingSelect');
} else {
  console.log('oldFilters pattern not matched');
}

// 4. Update viewDeviceDetail and openEditDeviceModal
const oldViewDevice = /function viewDeviceDetail\(id\) \{[\s\S]*?openModal\('modal-view-device'\);\r?\n\}/m;
const newViewDevice = `function viewDeviceDetail(id) {
  const d = currentDevices.find(dev => dev.id === id);
  if (!d) return;

  const content = document.getElementById('view-device-content');
  const bld = currentBuildings.find(b => b.id === d.buildingId);
  const statusBadge = getStatusBadge(d.status);

  content.innerHTML = \`
    <div class="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
      <div>
        <span class="text-slate-500 block">Nama Perangkat:</span>
        <span class="font-bold text-slate-100">\${d.name}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Status Terkini:</span>
        <div>\${statusBadge}</div>
      </div>
      <div>
        <span class="text-slate-500 block">IP Target Probe:</span>
        <span class="font-mono text-cyan-300 font-bold">\${d.ip}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Display IP / Subnet:</span>
        <span class="font-mono text-slate-200">\${d.displayIp || d.ip}</span>
      </div>
      <div>
        <span class="text-slate-500 block">MAC Address:</span>
        <span class="font-mono text-slate-300">\${d.mac || '-'}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Gedung / Fakultas:</span>
        <span class="text-slate-200 font-medium">\${bld ? bld.name : (d.buildingName || d.buildingId)}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Tipe & Protokol:</span>
        <span class="text-slate-200 uppercase">\${d.type} (\${d.protocol || 'icmp'})</span>
      </div>
      <div>
        <span class="text-slate-500 block">Latensi RTT:</span>
        <span class="font-mono text-emerald-400 font-bold">\${d.latency !== null ? d.latency + ' ms' : 'Timeout (RTO)'}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Uptime Ketersediaan:</span>
        <span class="font-mono text-purple-400 font-bold">\${d.uptimePercentage ?? 99.8}%</span>
      </div>
      <div>
        <span class="text-slate-500 block">Packet Loss:</span>
        <span class="font-mono \${d.packetLoss > 0 ? 'text-red-400 font-bold' : 'text-slate-300'}">\${d.packetLoss ?? 0}%</span>
      </div>
      <div class="col-span-2">
        <span class="text-slate-500 block">Lokasi & Keterangan:</span>
        <span class="text-slate-300">\${d.locationDescription || '-'}</span>
      </div>
      <div class="col-span-2 text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
        Pemeriksaan Terakhir: \${d.lastChecked ? new Date(d.lastChecked).toLocaleString('id-ID') : '-'}
      </div>
    </div>
  \`;

  document.getElementById('btn-view-device-ping').onclick = () => {
    pingSingleDevice(d.id);
  };

  const btnEdit = document.getElementById('btn-view-device-edit');
  if (btnEdit) {
    if (currentUser.role === 'PIMPINAN') {
      btnEdit.classList.add('hidden');
    } else {
      btnEdit.classList.remove('hidden');
      btnEdit.onclick = () => {
        closeModal('modal-view-device');
        openEditDeviceModal(d.id);
      };
    }
  }

  openModal('modal-view-device');
}`;

if (oldViewDevice.test(content)) {
  content = content.replace(oldViewDevice, newViewDevice);
  console.log('Updated viewDeviceDetail');
} else {
  console.log('oldViewDevice pattern not matched');
}

// 5. Update openEditDeviceModal to ensure edit-dev-building options are set
const oldEditModal = /function openEditDeviceModal\(id\) \{[\s\S]*?openModal\('modal-edit-device'\);\r?\n\}/m;
const newEditModal = `function openEditDeviceModal(id) {
  const d = currentDevices.find(dev => dev.id === id);
  if (!d) return;

  const selectEdit = document.getElementById('edit-dev-building');
  if (selectEdit && selectEdit.options.length === 0 && currentBuildings.length > 0) {
    selectEdit.innerHTML = currentBuildings.map(b => \`<option value="\${b.id}">\${b.name}</option>\`).join('');
  }

  document.getElementById('edit-dev-id').value = d.id;
  document.getElementById('edit-dev-name').value = d.name;
  document.getElementById('edit-dev-type').value = d.type;
  document.getElementById('edit-dev-building').value = d.buildingId;
  document.getElementById('edit-dev-ip').value = d.ip;
  document.getElementById('edit-dev-display-ip').value = d.displayIp || d.ip;
  document.getElementById('edit-dev-mac').value = d.mac || '';
  document.getElementById('edit-dev-protocol').value = d.protocol || 'icmp';
  document.getElementById('edit-dev-location').value = d.locationDescription || '';

  openModal('modal-edit-device');
}`;

if (oldEditModal.test(content)) {
  content = content.replace(oldEditModal, newEditModal);
  console.log('Updated openEditDeviceModal');
} else {
  console.log('oldEditModal pattern not matched');
}

// 6. Update loadAllData device count
if (!content.includes("table-device-count")) {
  content = content.replace(
    "document.getElementById('last-sync-time').textContent = new Date().toLocaleTimeString('id-ID');",
    "document.getElementById('last-sync-time').textContent = new Date().toLocaleTimeString('id-ID');\n    const countBadge = document.getElementById('table-device-count');\n    if (countBadge) countBadge.textContent = `${currentDevices.length} Perangkat`;"
  );
  console.log('Updated loadAllData table-device-count');
}

fs.writeFileSync(path, content, 'utf8');
console.log('All app.js improvements saved successfully!');
