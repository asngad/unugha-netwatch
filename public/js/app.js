// UNUGHA NetWatch - Client-side Logic (v1.2 with RBAC, Bandwidth & SLA Export)
let socket;
let latencyChart;
let bandwidthChart;
let topologyNetwork = null;
let soundEnabled = false;
let currentDevices = [];
let currentBuildings = [];
let currentUser = {
  username: 'admin',
  name: 'Ahmad Fauzi, S.Kom. (Kepala Puskom & NOC)',
  role: 'ADMIN_NOC',
  email: 'noc@unugha.ac.id'
};

// Audio Synthesizer via Web Audio API (Zero external assets needed)
function playBeep(freq = 880, duration = 0.2, type = 'sine') {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

function playAlertSound() {
  playBeep(440, 0.15, 'sawtooth');
  setTimeout(() => playBeep(330, 0.25, 'sawtooth'), 180);
}

function playSuccessSound() {
  playBeep(523.25, 0.12, 'sine');
  setTimeout(() => playBeep(659.25, 0.15, 'sine'), 130);
}

// Inisialisasi Aplikasi Saat Halaman Selesai Dimuat
document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('unugha_auth_user') || sessionStorage.getItem('unugha_auth_user');
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Session restore error:', e);
  }
  try { initSocket(); } catch (e) { console.error('Socket init error:', e); }
  try { initCharts(); } catch (e) { console.error('Charts init error:', e); }
  try { loadAllData(); } catch (e) { console.error('Load data error:', e); }
  try { setupEventListeners(); } catch (e) { console.error('Listeners error:', e); }
  try { updateUserUI(); } catch (e) { console.error('User UI error:', e); }
});

// Setup WebSocket Client
function initSocket() {
  if (typeof io === 'undefined') {
    console.warn('Socket.io library belum terpasang.');
    return;
  }
  try {
    socket = io();

    socket.on('connect', () => {
      const ind = document.getElementById('ws-indicator');
      const txt = document.getElementById('ws-status-text');
      if (ind) {
        ind.classList.remove('bg-red-500');
        ind.classList.add('bg-emerald-500', 'pulse-up');
      }
      if (txt) txt.textContent = 'Live Connected';
    });

    socket.on('disconnect', () => {
      const ind = document.getElementById('ws-indicator');
      const txt = document.getElementById('ws-status-text');
      if (ind) {
        ind.classList.remove('bg-emerald-500', 'pulse-up');
        ind.classList.add('bg-red-500');
      }
      if (txt) txt.textContent = 'Terputus';
    });

    socket.on('stats:summary', (summary) => {
      updateSummaryCards(summary);
      const syncEl = document.getElementById('last-sync-time');
      if (syncEl) syncEl.textContent = new Date().toLocaleTimeString('id-ID');
    });

    socket.on('device:update', (updatedDev) => {
      updateDeviceRow(updatedDev);
      updateTopologyNode(updatedDev);
    });

    socket.on('incident:new', (incident) => {
      playAlertSound();
      showToast(`🚨 Gangguan: ${incident.deviceName} (${incident.buildingName}) DOWN!`, 'danger');
      prependIncident(incident);
    });

    socket.on('incident:resolved', (incident) => {
      playSuccessSound();
      showToast(`✅ Pulih: ${incident.deviceName} kembali normal!`, 'success');
      resolveIncidentInTable(incident.id);
    });

    socket.on('metric:sample', (sample) => {
      addLatencyChartPoint(sample);
    });

    socket.on('bandwidth:update', (bw) => {
      addBandwidthPoint(bw);
    });

    socket.on('hardware:update', (hw) => {
      updateHardwareUI(hw);
    });
  } catch (err) {
    console.warn('Socket.io connection warning:', err);
  }
}

// Inisialisasi Charts (Latency & Bandwidth)
function initCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js library belum tersedia.');
    return;
  }
  try {
    // 1. Latency Chart
    const canvasLat = document.getElementById('latency-chart');
    if (canvasLat) {
      const ctxLatency = canvasLat.getContext('2d');
      latencyChart = new Chart(ctxLatency, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Latensi Rata-rata (ms)',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
            y: { beginAtZero: true, suggestedMax: 60, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
          }
        }
      });
    }

    // 2. Bandwidth Traffic Chart (Dual Line: Download / Upload)
    const canvasBw = document.getElementById('bandwidth-chart');
    if (canvasBw) {
      const ctxBw = canvasBw.getContext('2d');
      bandwidthChart = new Chart(ctxBw, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Download (Mbps)',
              data: [],
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              pointRadius: 2
            },
            {
              label: 'Upload (Mbps)',
              data: [],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              pointRadius: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: { color: '#cbd5e1', font: { size: 11 } }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
            y: { beginAtZero: true, suggestedMax: 250, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
          }
        }
      });
    }
  } catch (err) {
    console.warn('Gagal menginisialisasi chart:', err);
  }
}

function addLatencyChartPoint(sample) {
  if (!latencyChart) return;
  const timeLabel = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  latencyChart.data.labels.push(timeLabel);
  latencyChart.data.datasets[0].data.push(sample.avgLatency);

  if (latencyChart.data.labels.length > 20) {
    latencyChart.data.labels.shift();
    latencyChart.data.datasets[0].data.shift();
  }
  latencyChart.update('none');
}

function addBandwidthPoint(bw) {
  const elDown = document.getElementById('bw-current-down');
  const elUp = document.getElementById('bw-current-up');
  const elUtil = document.getElementById('bw-utilization');
  const elBar = document.getElementById('bw-util-bar');

  if (elDown) elDown.textContent = `${bw.downloadMbps} Mbps`;
  if (elUp) elUp.textContent = `${bw.uploadMbps} Mbps`;
  if (elUtil) elUtil.textContent = `${bw.utilizationPercentage}%`;
  if (elBar) elBar.style.width = `${Math.min(100, bw.utilizationPercentage)}%`;

  // Update 4 ISP Multi-WAN breakdown
  if (bw.isps && Array.isArray(bw.isps)) {
    bw.isps.forEach(isp => {
      if (isp.id === 'isp-citra') {
        const el = document.getElementById('bw-isp-citra');
        if (el) el.textContent = `${isp.downloadMbps} Mbps`;
      } else if (isp.id === 'isp-indibiz') {
        const el = document.getElementById('bw-isp-indibiz');
        if (el) el.textContent = `${isp.downloadMbps} Mbps`;
      } else if (isp.id === 'isp-starlink') {
        const el = document.getElementById('bw-isp-starlink');
        if (el) el.textContent = `${isp.downloadMbps} Mbps`;
      } else if (isp.id === 'isp-starlite') {
        const el = document.getElementById('bw-isp-starlite');
        if (el) el.textContent = `${isp.downloadMbps} Mbps`;
      }
    });
  }

  if (!bandwidthChart) return;
  const timeLabel = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  bandwidthChart.data.labels.push(timeLabel);
  bandwidthChart.data.datasets[0].data.push(bw.downloadMbps);
  bandwidthChart.data.datasets[1].data.push(bw.uploadMbps);

  if (bandwidthChart.data.labels.length > 20) {
    bandwidthChart.data.labels.shift();
    bandwidthChart.data.datasets[0].data.shift();
    bandwidthChart.data.datasets[1].data.shift();
  }
  bandwidthChart.update('none');
}

// Mengambil seluruh data awal via REST API
async function loadAllData() {
  try {
    const [statsRes, devRes, bldRes, incRes, topoRes, metricRes, bwRes, settRes] = await Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/devices').then(r => r.json()),
      fetch('/api/buildings').then(r => r.json()),
      fetch('/api/incidents').then(r => r.json()),
      fetch('/api/topology').then(r => r.json()),
      fetch('/api/metrics').then(r => r.json()),
      fetch('/api/bandwidth').then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]);

    if (statsRes.success) updateSummaryCards(statsRes.data);
    if (bldRes.success) {
      currentBuildings = bldRes.data;
      renderBuildings(bldRes.data);
      populateBuildingSelect(bldRes.data);
    }
    if (devRes.success) {
      currentDevices = devRes.data;
      renderDevicesTable(devRes.data);
    }
    if (incRes.success) renderIncidents(incRes.data);
    if (topoRes.success) renderTopology(topoRes.data);
    if (metricRes.success && metricRes.data.length > 0 && latencyChart) {
      metricRes.data.forEach(m => {
        const time = new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        latencyChart.data.labels.push(time);
        latencyChart.data.datasets[0].data.push(m.avgLatency);
      });
      latencyChart.update();
    }
    if (bwRes.success && bwRes.data.current) {
      addBandwidthPoint(bwRes.data.current);
    }
    if (settRes.success) populateSettings(settRes.data);

    document.getElementById('last-sync-time').textContent = new Date().toLocaleTimeString('id-ID');
  } catch (err) {
    console.error('Error fetching initial data:', err);
    showToast('Gagal memuat beberapa data dari server', 'danger');
  }
}

// Update Ringkasan Stat Cards
function updateSummaryCards(stats) {
  document.getElementById('stat-total').textContent = stats.totalDevices ?? (stats.up + stats.warning + stats.down);
  document.getElementById('stat-up').textContent = stats.up ?? 0;
  document.getElementById('stat-warning').textContent = stats.warning ?? 0;
  document.getElementById('stat-down').textContent = stats.down ?? 0;
  document.getElementById('stat-latency').textContent = `${stats.avgLatency ?? 0} ms`;
  document.getElementById('stat-sla').textContent = `${stats.overallSla ?? 99.8}%`;

  const downCard = document.getElementById('card-down');
  if (stats.down > 0) {
    downCard.classList.add('border-red-500', 'bg-red-950/30');
    downCard.classList.remove('border-slate-800');
  } else {
    downCard.classList.remove('border-red-500', 'bg-red-950/30');
    downCard.classList.add('border-slate-800');
  }
}

// Render Gedung Kampus
function renderBuildings(buildings) {
  const container = document.getElementById('buildings-container');
  container.innerHTML = buildings.map(b => {
    let healthColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (b.downCount > 0) {
      healthColor = 'text-red-400 bg-red-500/10 border-red-500/30';
    } else if (b.warnCount > 0) {
      healthColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }

    return `
      <div class="glass-panel p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3 cursor-pointer" onclick="filterByBuildingFromMap('${b.id}')">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white" style="background-color: ${b.color || '#059669'};">
              <i class="fa-solid ${b.icon || 'fa-building'}"></i>
            </div>
            <div>
              <h4 class="font-semibold text-sm text-slate-100 hover:text-emerald-400 transition">${b.name}</h4>
              <p class="text-xs text-slate-400">${b.code} • ${b.location}</p>
            </div>
          </div>
          <span class="px-2.5 py-1 text-xs font-bold rounded-full border ${healthColor}">
            ${b.healthPercentage}% OK
          </span>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span class="cursor-pointer hover:text-emerald-400" onclick="filterByBuildingFromMap('${b.id}')"><i class="fa-solid fa-network-wired mr-1"></i>${b.deviceCount} Unit</span>
          <div class="flex items-center space-x-1.5">
            <button onclick="openEditBuildingModal('${b.id}')" class="px-1.5 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded transition" title="Edit Gedung">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button onclick="deleteBuilding('${b.id}')" class="px-1.5 py-0.5 text-[11px] bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-500/30 rounded transition" title="Hapus Gedung">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Tabel Perangkat
function renderDevicesTable(devices) {
  const tbody = document.getElementById('devices-tbody');
  if (!tbody) return;

  if (devices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-400">
          <div class="flex flex-col items-center justify-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 text-xl">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <div class="text-sm font-semibold text-slate-300">Tidak ada perangkat yang cocok dengan kriteria filter</div>
            <p class="text-xs text-slate-500 max-w-sm">Periksa kembali kata kunci pencarian nama, alamat IP, atau filter gedung dan status.</p>
            <button type="button" onclick="resetTableFilters()" class="px-3.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 rounded-lg transition flex items-center">
              <i class="fa-solid fa-arrow-rotate-left mr-1.5"></i> Reset Filter
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const isAdmin = currentUser.role === 'ADMIN_NOC';
  const isTeknisi = currentUser.role === 'TEKNISI';

  tbody.innerHTML = devices.map(d => {
    const statusBadge = getStatusBadge(d.status);
    const latencyDisplay = d.status === 'DOWN' 
      ? '<span class="text-red-400 font-mono font-bold">Timeout</span>' 
      : `<span class="font-mono text-emerald-400 font-bold">${d.latency ?? '-'} ms</span>`;
    const deviceIcon = getDeviceIcon(d.type);
    const bld = currentBuildings.find(b => b.id === d.buildingId);
    const bldName = bld ? bld.name : (d.buildingName || d.buildingId);

    let typeBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
    if (d.type === 'router') typeBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    else if (d.type === 'switch') typeBadgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    else if (d.type === 'access_point') typeBadgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    else if (d.type === 'server') typeBadgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';

    return `
      <tr id="device-row-${d.id}" class="border-b border-slate-800/80 hover:bg-slate-800/40 transition">
        <td class="py-3 px-4">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 flex-shrink-0 shadow-sm">
              <i class="fa-solid ${deviceIcon}"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-slate-100 text-sm">${d.name}</span>
                <span class="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${typeBadgeColor}">${d.type.replace('_', ' ')}</span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">${d.locationDescription || '-'}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-mono">
          <div class="font-bold text-cyan-300">${d.displayIp || d.ip}</div>
          <div class="text-[11px] text-slate-500 uppercase mt-0.5">${d.protocol || 'icmp'} • ${d.mac || '-'}</div>
        </td>
        <td class="py-3 px-4 text-xs text-slate-300">
          <span class="inline-block bg-slate-800/80 border border-slate-700/80 px-2 py-1 rounded text-slate-300 font-medium max-w-[200px] truncate" title="${bldName}">${bldName}</span>
        </td>
        <td class="py-3 px-4">
          ${statusBadge}
        </td>
        <td class="py-3 px-4 text-xs">
          ${latencyDisplay}
        </td>
        <td class="py-3 px-4 text-xs font-mono text-slate-300">
          ${d.uptimePercentage ?? 99.8}%
        </td>
        <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
          <button type="button" onclick="viewDeviceDetail('${d.id}')" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg transition" title="Lihat Detail Lengkap">
            <i class="fa-solid fa-eye"></i>
          </button>
          ${(isAdmin || isTeknisi) ? `
            <button type="button" onclick="pingSingleDevice('${d.id}')" class="px-2.5 py-1 text-xs bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-lg transition" title="Ping Langsung">
              <i class="fa-solid fa-bolt"></i>
            </button>
            <button type="button" onclick="openEditDeviceModal('${d.id}')" class="px-2.5 py-1 text-xs bg-amber-600/20 text-amber-300 hover:bg-amber-600/40 border border-amber-500/30 rounded-lg transition" title="Edit Data Perangkat">
              <i class="fa-solid fa-pen"></i>
            </button>
          ` : '<span class="text-xs text-slate-500">Read-Only</span>'}
          ${isAdmin ? `
            <button type="button" onclick="deleteDevice('${d.id}')" class="px-2.5 py-1 text-xs bg-red-600/20 text-red-300 hover:bg-red-600/40 border border-red-500/30 rounded-lg transition" title="Hapus Perangkat">
              <i class="fa-solid fa-trash"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadge(status) {
  if (status === 'UP') {
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span> UP
    </span>`;
  } else if (status === 'WARNING') {
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span> WARNING
    </span>`;
  } else if (status === 'DOWN') {
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
      <span class="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-ping"></span> DOWN
    </span>`;
  }
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">UNKNOWN</span>`;
}

function getDeviceIcon(type) {
  switch (type) {
    case 'router': return 'fa-network-wired';
    case 'switch': return 'fa-server';
    case 'access_point': return 'fa-wifi';
    case 'server': return 'fa-hard-drive';
    case 'firewall': return 'fa-shield-halved';
    default: return 'fa-microchip';
  }
}

function updateDeviceRow(dev) {
  const row = document.getElementById(`device-row-${dev.id}`);
  if (!row) return;

  const idx = currentDevices.findIndex(d => d.id === dev.id);
  if (idx !== -1) {
    currentDevices[idx] = { ...currentDevices[idx], ...dev };
  }

  const statusCell = row.children[3];
  const latencyCell = row.children[4];
  const uptimeCell = row.children[5];

  if (statusCell) statusCell.innerHTML = getStatusBadge(dev.status);
  if (latencyCell) {
    latencyCell.innerHTML = dev.status === 'DOWN'
      ? '<span class="text-red-400 font-mono">Timeout</span>'
      : `<span class="font-mono text-emerald-400 font-bold">${dev.latency ?? '-'} ms</span>`;
  }
  if (uptimeCell) {
    uptimeCell.textContent = `${dev.uptimePercentage ?? 99}%`;
  }
}

// Render Peta Topologi Interaktif
function renderTopology(topologyData) {
  const container = document.getElementById('topology-canvas');
  if (!container || !window.vis) return;

  const nodes = new vis.DataSet(
    topologyData.nodes.map(n => {
      let color = { background: '#10b981', border: '#059669', highlight: { background: '#34d399', border: '#10b981' } };
      if (n.status === 'DOWN') {
        color = { background: '#ef4444', border: '#b91c1c', highlight: { background: '#f87171', border: '#ef4444' } };
      } else if (n.status === 'WARNING') {
        color = { background: '#f59e0b', border: '#d97706', highlight: { background: '#fbbf24', border: '#f59e0b' } };
      }

      return {
        id: n.id,
        label: `${n.label}\n(${n.ip})`,
        shape: n.type === 'router' ? 'hexagon' : (n.type === 'server' ? 'database' : 'box'),
        color: color,
        font: { color: '#f8fafc', face: 'Plus Jakarta Sans', size: 12, strokeWidth: 2, strokeColor: '#0f172a' },
        margin: 10
      };
    })
  );

  const edges = new vis.DataSet(
    topologyData.edges.map(e => ({
      from: e.from,
      to: e.to,
      label: e.label || '',
      color: { color: '#475569', highlight: '#10b981' },
      font: { color: '#94a3b8', size: 10, align: 'middle' },
      arrows: { to: { enabled: true, scaleFactor: 0.5 } }
    }))
  );

  const options = {
    layout: {
      hierarchical: {
        enabled: true,
        direction: 'UD',
        sortMethod: 'directed',
        nodeSpacing: 160,
        levelSeparation: 110
      }
    },
    physics: {
      stabilization: true,
      hierarchicalRepulsion: { nodeDistance: 150 }
    },
    interaction: {
      hover: true,
      zoomView: true,
      dragView: true
    }
  };

  topologyNetwork = new vis.Network(container, { nodes, edges }, options);

  topologyNetwork.on('click', (params) => {
    if (params.nodes.length > 0) {
      const selectedId = params.nodes[0];
      const dev = currentDevices.find(d => d.id === selectedId);
      if (dev) {
        showToast(`📍 ${dev.name} [${dev.status}] • Latensi: ${dev.latency ?? '-'}ms`, dev.status === 'DOWN' ? 'danger' : 'info');
        viewDeviceDetail(selectedId);
      }
    }
  });
}

function updateTopologyNode(dev) {
  if (!topologyNetwork) return;
  let bg = '#10b981';
  let border = '#059669';
  if (dev.status === 'DOWN') {
    bg = '#ef4444';
    border = '#b91c1c';
  } else if (dev.status === 'WARNING') {
    bg = '#f59e0b';
    border = '#d97706';
  }

  try {
    topologyNetwork.body.data.nodes.update({
      id: dev.id,
      color: { background: bg, border: border, highlight: { background: bg, border: border } }
    });
  } catch (e) {
    // ignored
  }
}

// Render Insiden
function renderIncidents(incidents) {
  const container = document.getElementById('incidents-container');
  if (incidents.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-slate-400 text-sm">Tidak ada riwayat gangguan tercatat. Jaringan UNUGHA berjalan optimal!</div>`;
    return;
  }

  container.innerHTML = incidents.map(inc => createIncidentHtml(inc)).join('');
}

function createIncidentHtml(inc) {
  const isResolved = inc.status === 'RESOLVED';
  const badge = isResolved
    ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">RESOLVED</span>`
    : `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">ACTIVE GANGGUAN</span>`;

  const canAck = (currentUser.role === 'ADMIN_NOC' || currentUser.role === 'TEKNISI') && !isResolved && !inc.acknowledged;

  return `
    <div id="inc-card-${inc.id}" class="p-4 rounded-xl border ${isResolved ? 'border-slate-800 bg-slate-900/40' : 'border-red-500/40 bg-red-950/20'} flex flex-col md:flex-row md:items-center justify-between gap-3 transition">
      <div class="flex items-start space-x-3">
        <div class="mt-1 w-8 h-8 rounded-lg ${isResolved ? 'bg-slate-800 text-emerald-400' : 'bg-red-900/60 text-red-300'} flex items-center justify-center text-sm font-bold">
          <i class="fa-solid ${isResolved ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <h5 class="font-semibold text-slate-100 text-sm">${inc.deviceName}</h5>
            ${badge}
          </div>
          <p class="text-xs text-slate-400 mt-0.5">${inc.buildingName} • ${inc.message}</p>
          <div class="text-[11px] text-slate-500 mt-1">
            Mulai: ${new Date(inc.startedAt).toLocaleString('id-ID')}
            ${inc.resolvedAt ? ` | Selesai: ${new Date(inc.resolvedAt).toLocaleString('id-ID')}` : ''}
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-1.5 self-end md:self-auto">
        <button onclick="viewIncidentDetail('${inc.id}')" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg transition" title="Lihat Detail Insiden">
          <i class="fa-solid fa-eye"></i> Detail
        </button>
        ${canAck ? `
          <button onclick="acknowledgeIncident('${inc.id}')" class="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded-lg transition" title="Konfirmasi Teknisi">
            <i class="fa-solid fa-check-double"></i> Ack
          </button>
        ` : ''}
        <button onclick="deleteIncident('${inc.id}')" class="px-2.5 py-1 text-xs bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-500/30 rounded-lg transition" title="Hapus Log Gangguan">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

function prependIncident(inc) {
  const container = document.getElementById('incidents-container');
  const div = document.createElement('div');
  div.innerHTML = createIncidentHtml(inc);
  container.prepend(div.firstElementChild);
}

function resolveIncidentInTable(incId) {
  const card = document.getElementById(`inc-card-${incId}`);
  if (card) {
    card.classList.remove('border-red-500/40', 'bg-red-950/20');
    card.classList.add('border-slate-800', 'bg-slate-900/40');
    const badge = card.querySelector('span');
    if (badge) {
      badge.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      badge.textContent = 'RESOLVED';
    }
  }
}

// User Actions
async function pingSingleDevice(id) {
  showToast(`Sedang melakukan ping manual ke perangkat...`, 'info');
  try {
    const res = await fetch(`/api/devices/${id}/ping`, { method: 'POST' }).then(r => r.json());
    if (res.success) {
      const dev = res.data.device;
      showToast(`Hasil Ping ${dev.name}: ${dev.status} (${dev.latency ?? '-'}ms)`, dev.status === 'DOWN' ? 'danger' : 'success');
      updateDeviceRow(dev);
    } else {
      showToast(res.error || 'Gagal melakukan ping', 'danger');
    }
  } catch (e) {
    showToast('Terjadi kesalahan jaringan', 'danger');
  }
}

async function acknowledgeIncident(id) {
  try {
    const res = await fetch(`/api/incidents/${id}/acknowledge`, { method: 'POST' }).then(r => r.json());
    if (res.success) {
      showToast('Insiden telah di-acknowledge', 'success');
      loadAllData();
    }
  } catch (e) {
    showToast('Gagal memproses acknowledge', 'danger');
  }
}

async function triggerFullScan() {
  const btn = document.getElementById('btn-scan');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Memindai...`;
  try {
    await fetch('/api/scan', { method: 'POST' });
    showToast('Siklus pemindaian jaringan UNUGHA sedang berlangsung!', 'info');
  } catch (e) {
    showToast('Gagal memicu pemindaian', 'danger');
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-rotate mr-1.5"></i> Pindai Sekarang`;
    }, 2000);
  }
}

async function deleteDevice(id) {
  if (currentUser.role !== 'ADMIN_NOC') {
    showToast('Hanya Admin NOC yang berhak menghapus perangkat!', 'danger');
    return;
  }
  const d = currentDevices.find(dev => dev.id === id);
  const name = d ? d.name : id;
  if (!confirm(`Yakin ingin menghapus perangkat "${name}" dari sistem pemantauan UNUGHA?`)) return;
  try {
    const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) {
      showToast(`Perangkat "${name}" berhasil dihapus dari pemantauan`, 'success');
      loadAllData();
    } else {
      showToast(res.error || 'Gagal menghapus perangkat', 'danger');
    }
  } catch (e) {
    showToast('Gagal menghapus perangkat', 'danger');
  }
}

// User RBAC & Switching
function updateUserUI() {
  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-display-role');
  const statusEl = document.getElementById('session-status-text');
  const headerBadge = document.getElementById('session-header-badge');
  const confirmUserEl = document.getElementById('session-confirm-user');

  if (nameEl) nameEl.textContent = currentUser.name;
  if (roleEl) roleEl.textContent = currentUser.role;

  if (confirmUserEl) {
    confirmUserEl.textContent = `${currentUser.name} (${currentUser.role})`;
  }

  const isGuest = currentUser.role === 'GUEST';
  if (statusEl) {
    statusEl.innerHTML = isGuest
      ? '<span class="text-amber-400 font-medium"><i class="fa-solid fa-lock text-[8px] mr-1"></i> Mode Tamu</span>'
      : '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span> Sesi Aktif';
    statusEl.className = isGuest
      ? 'text-[9px] text-amber-400 font-medium flex items-center'
      : 'text-[9px] text-emerald-400 font-medium flex items-center';
  }

  if (headerBadge) {
    headerBadge.textContent = isGuest ? 'Belum Login' : 'Autentikasi';
    headerBadge.className = isGuest ? 'text-amber-400 font-mono' : 'text-emerald-400 font-mono';
  }

  const btnAdd = document.getElementById('btn-add-device-modal');
  if (currentUser.role === 'PIMPINAN' || isGuest) {
    if (btnAdd) btnAdd.classList.add('hidden');
  } else {
    if (btnAdd) btnAdd.classList.remove('hidden');
  }

  renderDevicesTable(currentDevices);
}

function switchUserRole(roleKey) {
  if (roleKey === 'admin') {
    currentUser = {
      username: 'admin',
      name: 'Ahmad Fauzi, S.Kom. (Kepala Puskom & NOC)',
      role: 'ADMIN_NOC',
      email: 'noc@unugha.ac.id'
    };
    showToast('Beralih ke peran: Admin NOC (Akses Penuh)', 'info');
  } else if (roleKey === 'teknisi') {
    currentUser = {
      username: 'teknisi',
      name: 'Budi Santoso (Teknisi Jaringan & Lab FTI)',
      role: 'TEKNISI',
      email: 'teknisi.fti@unugha.ac.id'
    };
    showToast('Beralih ke peran: Teknisi Jaringan (Diagnostik & Operator)', 'info');
  } else if (roleKey === 'rektorat') {
    currentUser = {
      username: 'rektorat',
      name: 'Prof. Dr. KH. Nasrullah (Pimpinan Rektorat UNUGHA)',
      role: 'PIMPINAN',
      email: 'rektorat@unugha.ac.id'
    };
    showToast('Beralih ke peran: Pimpinan Rektorat (Laporan Eksekutif & View-Only)', 'info');
  }
  updateUserUI();
  closeModal('modal-switch-user');
}

// SLA Report Modal & Export
async function openSlaReportModal() {
  openModal('modal-sla-report');
  const contentDiv = document.getElementById('sla-report-body');
  contentDiv.innerHTML = `<div class="py-12 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Menyiapkan laporan resmi SLA UNUGHA...</p></div>`;

  try {
    const res = await fetch('/api/reports/sla').then(r => r.json());
    if (res.success) {
      const rep = res.data;
      contentDiv.innerHTML = `
        <div class="report-printable space-y-6">
          <!-- Kop Surat Resmi Kampus UNUGHA -->
          <div class="border-b-2 border-slate-900 pb-4 text-center">
            <h2 class="text-xl font-extrabold uppercase tracking-wide text-slate-900">UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI (UNUGHA) CILACAP</h2>
            <h3 class="text-sm font-bold text-slate-800">PUSAT KOMPUTER DAN TEKNOLOGI INFORMASI (PUSKOM & NOC)</h3>
            <p class="text-xs text-slate-600">Jl. Kemerdekaan Barat No. 17 Kesugihan, Cilacap, Jawa Tengah • Telp: (0282) 695407 • Web: unugha.ac.id</p>
          </div>

          <!-- Judul Laporan & Metadata -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-700 border-b border-slate-300 pb-3 gap-2">
            <div>
              <h4 class="font-bold text-sm text-slate-900">LAPORAN KINERJA KETERSEDIAAN JARINGAN (SLA)</h4>
              <p>Periode Pemantauan: ${rep.period}</p>
            </div>
            <div class="sm:text-right">
              <p>Tanggal Terbit: ${new Date(rep.generatedAt).toLocaleString('id-ID')}</p>
              <p class="font-bold text-emerald-700">Rata-rata Ketersediaan Global: ${rep.overallSla}%</p>
            </div>
          </div>

          <!-- Ringkasan Eksekutif -->
          <div class="grid grid-cols-3 gap-4 text-center text-xs">
            <div class="p-3 bg-slate-100 rounded-lg border border-slate-300">
              <div class="text-slate-500 font-medium">Total Perangkat</div>
              <div class="text-lg font-black text-slate-800">${rep.totalDevices} Unit</div>
            </div>
            <div class="p-3 bg-slate-100 rounded-lg border border-slate-300">
              <div class="text-slate-500 font-medium">Total Insiden Gangguan</div>
              <div class="text-lg font-black text-slate-800">${rep.totalIncidents} Kali</div>
            </div>
            <div class="p-3 bg-slate-100 rounded-lg border border-slate-300">
              <div class="text-slate-500 font-medium">Insiden Aktif Saat Ini</div>
              <div class="text-lg font-black text-red-600">${rep.activeIncidents} Unit</div>
            </div>
          </div>

          <!-- Tabel Ketersediaan per Gedung -->
          <div>
            <h5 class="text-xs font-bold uppercase text-slate-800 mb-2">1. Rekapitulasi Ketersediaan Jaringan per Fakultas & Gedung</h5>
            <table class="w-full text-left text-xs border border-slate-300">
              <thead class="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th class="p-2 border-r border-slate-300">No</th>
                  <th class="p-2 border-r border-slate-300">Gedung / Fakultas</th>
                  <th class="p-2 border-r border-slate-300 text-center">Jumlah AP & Switch</th>
                  <th class="p-2 border-r border-slate-300 text-center">Uptime SLA (%)</th>
                  <th class="p-2 border-r border-slate-300 text-center">Total Gangguan</th>
                  <th class="p-2 text-center">Downtime (Menit)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-300">
                ${rep.buildingReports.map((bld, idx) => `
                  <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
                    <td class="p-2 border-r border-slate-300 text-center">${idx + 1}</td>
                    <td class="p-2 border-r border-slate-300 font-medium text-slate-900">${bld.buildingName} (${bld.buildingCode})</td>
                    <td class="p-2 border-r border-slate-300 text-center">${bld.deviceCount}</td>
                    <td class="p-2 border-r border-slate-300 text-center font-bold ${bld.uptimePercentage >= 99 ? 'text-emerald-700' : 'text-amber-700'}">${bld.uptimePercentage}%</td>
                    <td class="p-2 border-r border-slate-300 text-center">${bld.incidentCount}</td>
                    <td class="p-2 text-center">${bld.totalDowntimeMinutes} m</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Tanda Tangan Penanggung Jawab -->
          <div class="pt-8 flex justify-between text-xs text-slate-800">
            <div>
              <p>Mengetahui,</p>
              <p class="font-bold">Pimpinan Rektorat UNUGHA</p>
              <div class="h-16"></div>
              <p class="font-bold underline">Prof. Dr. KH. Nasrullah</p>
              <p>NIP. 197208152000031002</p>
            </div>
            <div class="text-right">
              <p>Cilacap, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p class="font-bold">Kepala Pusat Komputer & Jaringan</p>
              <div class="h-16"></div>
              <p class="font-bold underline">Ahmad Fauzi, S.Kom.</p>
              <p>NIP. 198504122010011015</p>
            </div>
          </div>
        </div>
      `;
    }
  } catch (e) {
    contentDiv.innerHTML = `<div class="p-6 text-center text-red-400">Gagal memuat data laporan SLA.</div>`;
  }
}

function printSlaReport() {
  window.print();
}

function downloadSlaCsv() {
  window.location.href = '/api/reports/export/csv';
  showToast('File CSV Laporan SLA UNUGHA sedang diunduh...', 'info');
}

// Event Listeners & Modals

// ==================== AUTHENTICATION & LOGIN ADMIN ====================
function openLoginModal() {
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput && !uInput.value) {
    uInput.value = currentUser.username !== 'guest' ? currentUser.username : 'admin';
  }
  if (pInput && !pInput.value) {
    pInput.value = 'adminunugha';
  }
  openModal('modal-login-admin');
}

function selectLoginPreset(username, password) {
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) uInput.value = username;
  if (pInput) pInput.value = password;
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('login-remember')?.checked;
  const submitBtn = document.getElementById('btn-login-submit');

  if (!username || !password) {
    showToast('Username dan password harus diisi', 'danger');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengautentikasi...';
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(r => r.json());

    if (res.success) {
      currentUser = res.user;
      if (remember) {
        localStorage.setItem('unugha_auth_token', res.token);
        localStorage.setItem('unugha_auth_user', JSON.stringify(res.user));
        localStorage.setItem('unugha_stay_in_app', 'true');
      } else {
        sessionStorage.setItem('unugha_auth_token', res.token);
        sessionStorage.setItem('unugha_auth_user', JSON.stringify(res.user));
      }

      updateUserUI();
      closeModal('modal-login-admin');
      showToast(`Login berhasil! Selamat datang, ${res.user.name}`, 'success');
      playSuccessSound();
    } else {
      showToast(res.error || 'Autentikasi gagal. Periksa username dan password Anda.', 'danger');
    }
  } catch (err) {
    showToast('Terjadi kesalahan koneksi server saat login', 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i> Masuk Sekarang';
    }
  }
}

function promptSessionExit() {
  const confirmUserEl = document.getElementById('session-confirm-user');
  if (confirmUserEl) {
    confirmUserEl.textContent = `${currentUser.name} (${currentUser.role})`;
  }
  openModal('modal-session-confirm');
}

function stayInApp() {
  localStorage.setItem('unugha_stay_in_app', 'true');
  closeModal('modal-session-confirm');
  showToast('Sesi Anda dipertahankan di aplikasi UNUGHA NetWatch', 'success');
}

function executeLogout() {
  localStorage.removeItem('unugha_auth_token');
  localStorage.removeItem('unugha_auth_user');
  localStorage.removeItem('unugha_stay_in_app');
  sessionStorage.removeItem('unugha_auth_token');
  sessionStorage.removeItem('unugha_auth_user');

  currentUser = {
    username: 'guest',
    name: 'Tamu (Belum Login)',
    role: 'GUEST',
    email: 'guest@unugha.ac.id'
  };

  updateUserUI();
  closeModal('modal-session-confirm');
  showToast('Anda telah keluar dari aplikasi UNUGHA NetWatch (Mode Tamu)', 'info');
}

function setupEventListeners() {
  const formLogin = document.getElementById('form-login-admin');
  if (formLogin) {
    formLogin.addEventListener('submit', handleLoginSubmit);
  }

  document.getElementById('btn-scan').addEventListener('click', triggerFullScan);

  // Toggle Sound
  const soundBtn = document.getElementById('btn-toggle-sound');
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.innerHTML = soundEnabled 
      ? `<i class="fa-solid fa-volume-high text-emerald-400 mr-1.5"></i> Audio: ON`
      : `<i class="fa-solid fa-volume-xmark text-slate-400 mr-1.5"></i> Audio: OFF`;
    if (soundEnabled) {
      playSuccessSound();
      showToast('Audio peringatan diaktifkan', 'info');
    }
  });

  // Filter Table
  document.getElementById('search-device').addEventListener('input', applyTableFilters);
  document.getElementById('filter-building').addEventListener('change', applyTableFilters);
  document.getElementById('filter-status').addEventListener('change', applyTableFilters);

  // Form Add Device
  document.getElementById('form-add-device').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentUser.role === 'PIMPINAN') {
      showToast('Pimpinan memiliki hak akses Read-Only!', 'danger');
      return;
    }

    const payload = {
      name: document.getElementById('add-name').value.trim(),
      ip: document.getElementById('add-ip').value.trim(),
      displayIp: (document.getElementById('add-display-ip')?.value || '').trim() || document.getElementById('add-ip').value.trim(),
      mac: (document.getElementById('add-mac')?.value || '').trim() || '00:00:00:00:00:00',
      type: document.getElementById('add-type').value,
      buildingId: document.getElementById('add-building').value,
      protocol: document.getElementById('add-protocol').value,
      locationDescription: (document.getElementById('add-location')?.value || '').trim()
    };

    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        showToast('Perangkat baru berhasil ditambahkan!', 'success');
        closeModal('modal-add-device');
        document.getElementById('form-add-device').reset();
        loadAllData();
      } else {
        showToast(res.error || 'Gagal menambahkan perangkat', 'danger');
      }
    } catch (err) {
      showToast('Gagal mengirim data ke server', 'danger');
    }
  });

  // Form Edit Device
  const formEditDev = document.getElementById('form-edit-device');
  if (formEditDev) {
    formEditDev.addEventListener('submit', handleEditDeviceSubmit);
  }

  // Form Building CRUD
  const formBld = document.getElementById('form-building-crud');
  if (formBld) {
    formBld.addEventListener('submit', handleBuildingFormSubmit);
  }

  // Form User CRUD
  const formUser = document.getElementById('form-user-crud');
  if (formUser) {
    formUser.addEventListener('submit', handleUserCrudSubmit);
  }

  // Form Settings
  document.getElementById('form-settings').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentUser.role !== 'ADMIN_NOC') {
      showToast('Hanya Admin NOC yang dapat mengubah konfigurasi sistem!', 'danger');
      return;
    }

    const payload = {
      intervalSeconds: parseInt(document.getElementById('set-interval').value, 10),
      timeoutSeconds: parseInt(document.getElementById('set-timeout').value, 10),
      latencyWarningThresholdMs: parseInt(document.getElementById('set-threshold').value, 10),
      telegramEnabled: document.getElementById('set-tg-enabled').checked,
      telegramBotToken: document.getElementById('set-tg-token').value,
      telegramChatId: document.getElementById('set-tg-chat').value
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        showToast('Konfigurasi berhasil disimpan!', 'success');
      }
    } catch (e) {
      showToast('Gagal menyimpan konfigurasi', 'danger');
    }
  });

  // Test Telegram Button
  document.getElementById('btn-test-tg').addEventListener('click', async () => {
    const btn = document.getElementById('btn-test-tg');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Mengirim...`;
    try {
      const res = await fetch('/api/test/telegram', { method: 'POST' }).then(r => r.json());
      if (res.success && res.result && res.result.success) {
        showToast('Pesan uji coba Telegram berhasil terkirim!', 'success');
      } else {
        showToast(`Telegram Test: ${res.result?.message || res.result?.error || 'Periksa token & chat ID'}`, 'info');
      }
    } catch (e) {
      showToast('Gagal memanggil API test telegram', 'danger');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-brands fa-telegram mr-1.5"></i> Tes Kirim Pesan`;
    }
  });
}

function applyTableFilters() {
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
    countBadge.textContent = `${filtered.length} Perangkat`;
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
      buildings.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  }

  const optionsHtml = buildings.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  if (selectAdd) selectAdd.innerHTML = optionsHtml;
  if (selectEdit) selectEdit.innerHTML = optionsHtml;
}

function populateSettings(settings) {
  if (settings.intervalSeconds) document.getElementById('set-interval').value = settings.intervalSeconds;
  if (settings.timeoutSeconds) document.getElementById('set-timeout').value = settings.timeoutSeconds;
  if (settings.latencyWarningThresholdMs) document.getElementById('set-threshold').value = settings.latencyWarningThresholdMs;
  if (settings.telegramEnabled !== undefined) document.getElementById('set-tg-enabled').checked = settings.telegramEnabled;
  if (settings.telegramBotToken) document.getElementById('set-tg-token').value = settings.telegramBotToken;
  if (settings.telegramChatId) document.getElementById('set-tg-chat').value = settings.telegramChatId;
}

// Modal Helper
function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Simple Toast Notification
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  let bgClass = 'bg-slate-800 border-slate-700 text-slate-200';
  if (type === 'success') bgClass = 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200';
  if (type === 'danger') bgClass = 'bg-red-950/90 border-red-500/50 text-red-200';

  toast.className = `p-3.5 rounded-xl border shadow-xl flex items-center space-x-3 text-xs md:text-sm font-medium backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="ml-auto text-slate-400 hover:text-white" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Update Hardware Telemetry UI
function updateHardwareUI(hw) {
  if (!hw) return;

  // 1. Load Balancer EG1510XS (192.168.111.3)
  if (hw.loadBalancer) {
    const elLbCpu = document.getElementById('hw-lb-cpu');
    const elLbRam = document.getElementById('hw-lb-ram');
    if (elLbCpu) elLbCpu.textContent = `${hw.loadBalancer.cpuLoad}% CPU`;
    if (elLbRam) elLbRam.textContent = `${hw.loadBalancer.ramUsage}% RAM`;
  }

  // 2. Mikrotik Switch Rack (10.26.99.15)
  if (hw.switchRack) {
    const elSwCpu = document.getElementById('hw-sw-cpu');
    const elSwTemp = document.getElementById('hw-sw-temp');
    if (elSwCpu) elSwCpu.textContent = `${hw.switchRack.cpuLoad}% CPU`;
    if (elSwTemp) elSwTemp.textContent = `${hw.switchRack.temperatureC}°C`;
  }

  // 3. Linksys EA7500 AP Fleet (16 Unit)
  if (hw.apFleet) {
    const elApOnline = document.getElementById('hw-ap-online');
    const elApClients = document.getElementById('hw-ap-clients');
    if (elApOnline) elApOnline.textContent = `${hw.apFleet.onlineUnits}/${hw.apFleet.totalUnits} UP`;
    if (elApClients) elApClients.textContent = `${hw.apFleet.totalClientsConnected} User`;
  }

  // 4. Server SIAKAD (VM)
  if (hw.serverSiakad) {
    const elSrvCpu = document.getElementById('hw-siakad-cpu');
    const elSrvRam = document.getElementById('hw-siakad-ram');
    const elSrvDisk = document.getElementById('hw-siakad-disk');

    if (elSrvCpu) elSrvCpu.textContent = `${hw.serverSiakad.cpuLoad}% CPU`;
    if (elSrvRam) elSrvRam.textContent = `${hw.serverSiakad.ramUsage}% RAM`;
    if (elSrvDisk) elSrvDisk.textContent = `${hw.serverSiakad.diskUsagePercent}% Disk Used (Cluster VM)`;
  }
}

// Diagnostic Console Terminal Execution
async function runTerminalPing() {
  const host = document.getElementById('diag-target-host').value.trim();
  const count = parseInt(document.getElementById('diag-ping-count').value, 10) || 4;
  const term = document.getElementById('diagnostic-terminal-output');

  if (!host) {
    showToast('Masukkan target IP atau domain terlebih dahulu!', 'danger');
    return;
  }

  const btn = document.getElementById('btn-run-diag-ping');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Menjalankan...`;
  term.innerHTML = `<span class="text-emerald-400">unugha-noc@gateway:~$</span> ping -c ${count} ${host}\nSedang mengirim paket ICMP ke host target...\n`;

  try {
    const res = await fetch('/api/diagnostics/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, count })
    }).then(r => r.json());

    if (res.success && res.data.outputLines) {
      term.innerHTML = `<span class="text-emerald-400">unugha-noc@gateway:~$</span> ping -c ${count} ${host}\n\n` + 
        res.data.outputLines.join('\n') + `\n\n<span class="text-emerald-400">unugha-noc@gateway:~$</span> _`;
      showToast(`Ping diagnostik selesai (${res.data.packetLossPercent}% loss)`, res.data.packetLossPercent === 0 ? 'success' : 'danger');
    } else {
      term.innerHTML += `\nError: ${res.error || 'Gagal mengeksekusi ping'}`;
    }
  } catch (err) {
    term.innerHTML += `\nError jaringan: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-play mr-1.5"></i> Eksekusi Ping`;
  }
}

async function runTerminalTraceroute() {
  const host = document.getElementById('diag-target-host').value.trim() || 'siakad.unugha.ac.id';
  const term = document.getElementById('diagnostic-terminal-output');

  const btn = document.getElementById('btn-run-diag-trace');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Menelusuri...`;
  term.innerHTML = `<span class="text-emerald-400">unugha-noc@gateway:~$</span> traceroute ${host}\nMenelusuri jalur hop jaringan...\n`;

  try {
    const res = await fetch('/api/diagnostics/traceroute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: host })
    }).then(r => r.json());

    if (res.success && res.data.outputLines) {
      term.innerHTML = `<span class="text-emerald-400">unugha-noc@gateway:~$</span> traceroute ${host}\n\n` + 
        res.data.outputLines.join('\n') + `\n\n<span class="text-emerald-400">unugha-noc@gateway:~$</span> _`;
      showToast('Jalur traceroute berhasil dipetakan', 'success');
    }
  } catch (err) {
    term.innerHTML += `\nError traceroute: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-route mr-1.5"></i> Traceroute Hop`;
  }
}

// Switch between Logical Vis.js Topology and Spatial Campus Layout Map
function switchViewMode(mode) {
  const viewTopo = document.getElementById('view-logical-topology');
  const viewSpatial = document.getElementById('view-spatial-campus');
  const btnTopo = document.getElementById('btn-tab-topology');
  const btnSpatial = document.getElementById('btn-tab-spatial');

  if (mode === 'spatial') {
    viewTopo.classList.add('hidden');
    viewSpatial.classList.remove('hidden');
    btnSpatial.className = 'px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg transition';
    btnTopo.className = 'px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white rounded-lg transition';
  } else {
    viewSpatial.classList.add('hidden');
    viewTopo.classList.remove('hidden');
    btnTopo.className = 'px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg transition';
    btnSpatial.className = 'px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white rounded-lg transition';
  }
}

function filterByBuildingFromMap(bldId) {
  document.getElementById('filter-building').value = bldId;
  applyTableFilters();
  document.getElementById('devices-tbody').scrollIntoView({ behavior: 'smooth' });
  showToast('Memfilter daftar perangkat untuk gedung terpilih', 'info');
}

// Export Topology Canvas as High-Res PNG Image
function exportTopologyImage() {
  const viewTopo = document.getElementById('view-logical-topology');
  if (viewTopo && viewTopo.classList.contains('hidden')) {
    switchViewMode('logical');
  }
  const canvas = document.querySelector('#topology-canvas canvas');
  if (!canvas) {
    showToast('Kanvas topologi belum siap!', 'danger');
    return;
  }
  const image = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = image;
  a.download = `Topologi_Jaringan_UNUGHA_${new Date().toISOString().slice(0, 10)}.png`;
  a.click();
  showToast('Gambar diagram topologi UNUGHA berhasil diunduh (PNG)', 'success');
}

// Trigger Demo Chaos / Failover Simulation
async function triggerDemoFailover() {
  const btn = document.getElementById('btn-demo-failover');
  if (btn) btn.disabled = true;
  try {
    const res = await fetch('/api/demo/toggle-failover', { method: 'POST' }).then(r => r.json());
    if (res.success) {
      showToast(res.message, res.device.status === 'DOWN' ? 'danger' : 'success');
      loadAllData();
    }
  } catch (err) {
    showToast('Gagal memicu simulasi gangguan', 'danger');
  } finally {
    if (btn) {
      setTimeout(() => { btn.disabled = false; }, 1500);
    }
  }
}

// ==================== DEVICE CRUD FUNCTIONS ====================
function viewDeviceDetail(id) {
  const d = currentDevices.find(dev => dev.id === id);
  if (!d) return;

  const content = document.getElementById('view-device-content');
  const bld = currentBuildings.find(b => b.id === d.buildingId);
  const statusBadge = getStatusBadge(d.status);

  content.innerHTML = `
    <div class="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
      <div>
        <span class="text-slate-500 block">Nama Perangkat:</span>
        <span class="font-bold text-slate-100">${d.name}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Status Terkini:</span>
        <div>${statusBadge}</div>
      </div>
      <div>
        <span class="text-slate-500 block">IP Target Probe:</span>
        <span class="font-mono text-cyan-300 font-bold">${d.ip}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Display IP / Subnet:</span>
        <span class="font-mono text-slate-200">${d.displayIp || d.ip}</span>
      </div>
      <div>
        <span class="text-slate-500 block">MAC Address:</span>
        <span class="font-mono text-slate-300">${d.mac || '-'}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Gedung / Fakultas:</span>
        <span class="text-slate-200 font-medium">${bld ? bld.name : (d.buildingName || d.buildingId)}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Tipe & Protokol:</span>
        <span class="text-slate-200 uppercase">${d.type} (${d.protocol || 'icmp'})</span>
      </div>
      <div>
        <span class="text-slate-500 block">Latensi RTT:</span>
        <span class="font-mono text-emerald-400 font-bold">${d.latency !== null ? d.latency + ' ms' : 'Timeout (RTO)'}</span>
      </div>
      <div>
        <span class="text-slate-500 block">Uptime Ketersediaan:</span>
        <span class="font-mono text-purple-400 font-bold">${d.uptimePercentage ?? 99.8}%</span>
      </div>
      <div>
        <span class="text-slate-500 block">Packet Loss:</span>
        <span class="font-mono ${d.packetLoss > 0 ? 'text-red-400 font-bold' : 'text-slate-300'}">${d.packetLoss ?? 0}%</span>
      </div>
      <div class="col-span-2">
        <span class="text-slate-500 block">Lokasi & Keterangan:</span>
        <span class="text-slate-300">${d.locationDescription || '-'}</span>
      </div>
      <div class="col-span-2 text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
        Pemeriksaan Terakhir: ${d.lastChecked ? new Date(d.lastChecked).toLocaleString('id-ID') : '-'}
      </div>
    </div>
  `;

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
}

function openEditDeviceModal(id) {
  const d = currentDevices.find(dev => dev.id === id);
  if (!d) return;

  const selectEdit = document.getElementById('edit-dev-building');
  if (selectEdit && selectEdit.options.length === 0 && currentBuildings.length > 0) {
    selectEdit.innerHTML = currentBuildings.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
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
}

async function handleEditDeviceSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('edit-dev-id').value;
  const payload = {
    name: document.getElementById('edit-dev-name').value,
    type: document.getElementById('edit-dev-type').value,
    buildingId: document.getElementById('edit-dev-building').value,
    ip: document.getElementById('edit-dev-ip').value,
    displayIp: document.getElementById('edit-dev-display-ip').value,
    mac: document.getElementById('edit-dev-mac').value,
    protocol: document.getElementById('edit-dev-protocol').value,
    locationDescription: document.getElementById('edit-dev-location').value
  };

  try {
    const res = await fetch(`/api/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      showToast('Perangkat berhasil diperbarui!', 'success');
      closeModal('modal-edit-device');
      loadAllData();
    } else {
      showToast(res.error || 'Gagal memperbarui perangkat', 'danger');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'danger');
  }
}

// ==================== BUILDING CRUD FUNCTIONS ====================
function openAddBuildingModal() {
  document.getElementById('modal-building-title').innerHTML = '<i class="fa-solid fa-building text-emerald-400 mr-2"></i> Tambah Gedung Kampus';
  document.getElementById('crud-bld-id').value = '';
  document.getElementById('form-building-crud').reset();
  document.getElementById('crud-bld-color').value = '#059669';
  openModal('modal-building-crud');
}

function openEditBuildingModal(id) {
  const b = currentBuildings.find(bld => bld.id === id);
  if (!b) return;

  document.getElementById('modal-building-title').innerHTML = '<i class="fa-solid fa-pen-to-square text-amber-400 mr-2"></i> Edit Data Gedung';
  document.getElementById('crud-bld-id').value = b.id;
  document.getElementById('crud-bld-name').value = b.name;
  document.getElementById('crud-bld-code').value = b.code;
  document.getElementById('crud-bld-color').value = b.color || '#059669';
  document.getElementById('crud-bld-icon').value = b.icon || 'fa-building';
  document.getElementById('crud-bld-location').value = b.location || '';

  openModal('modal-building-crud');
}

async function handleBuildingFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('crud-bld-id').value;
  const payload = {
    name: document.getElementById('crud-bld-name').value,
    code: document.getElementById('crud-bld-code').value,
    color: document.getElementById('crud-bld-color').value,
    icon: document.getElementById('crud-bld-icon').value,
    location: document.getElementById('crud-bld-location').value
  };

  const isEdit = !!id;
  const url = isEdit ? `/api/buildings/${id}` : '/api/buildings';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      showToast(isEdit ? 'Data gedung berhasil diperbarui!' : 'Gedung baru berhasil ditambahkan!', 'success');
      closeModal('modal-building-crud');
      loadAllData();
    } else {
      showToast(res.error || 'Gagal menyimpan gedung', 'danger');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'danger');
  }
}

async function deleteBuilding(id) {
  if (currentUser.role !== 'ADMIN_NOC') {
    showToast('Hanya Admin NOC yang berhak menghapus gedung!', 'danger');
    return;
  }
  const bld = currentBuildings.find(b => b.id === id);
  const name = bld ? bld.name : id;
  const countDevs = currentDevices.filter(d => d.buildingId === id).length;
  let confirmMsg = `Yakin ingin menghapus gedung "${name}"?`;
  if (countDevs > 0) {
    confirmMsg += `\n\nPeringatan: Terdapat ${countDevs} perangkat yang terafiliasi dengan gedung ini.`;
  }
  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/api/buildings/${id}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) {
      showToast('Gedung berhasil dihapus', 'success');
      loadAllData();
    } else {
      showToast(res.error || 'Gagal menghapus gedung', 'danger');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'danger');
  }
}

// ==================== INCIDENT CRUD FUNCTIONS ====================
async function viewIncidentDetail(id) {
  try {
    const res = await fetch(`/api/incidents/${id}`).then(r => r.json());
    if (!res.success) {
      showToast('Insiden tidak ditemukan', 'danger');
      return;
    }
    const inc = res.data;
    const content = document.getElementById('incident-detail-content');
    const isResolved = inc.status === 'RESOLVED';
    const isPimpinan = currentUser.role === 'PIMPINAN';

    content.innerHTML = `
      <div class="space-y-3">
        <div class="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">ID Insiden:</span>
            <span class="font-mono text-slate-300">${inc.id}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Perangkat:</span>
            <span class="font-bold text-slate-100">${inc.deviceName}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Lokasi Gedung:</span>
            <span class="text-slate-200">${inc.buildingName}</span>
          </div>
          <div class="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
            <div>Waktu Mulai: ${new Date(inc.startedAt).toLocaleString('id-ID')}</div>
            ${inc.resolvedAt ? `<div>Waktu Selesai: ${new Date(inc.resolvedAt).toLocaleString('id-ID')}</div>` : ''}
          </div>
        </div>

        <div>
          <label class="block text-slate-400 mb-1 font-semibold">Status Insiden</label>
          <select id="edit-inc-status" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500" ${isPimpinan ? 'disabled' : ''}>
            <option value="OPEN" ${inc.status === 'OPEN' ? 'selected' : ''}>OPEN (Gangguan Masih Aktif)</option>
            <option value="INVESTIGATING" ${inc.status === 'INVESTIGATING' ? 'selected' : ''}>INVESTIGATING (Sedang Diperiksa Teknisi)</option>
            <option value="RESOLVED" ${inc.status === 'RESOLVED' ? 'selected' : ''}>RESOLVED (Selesai / Pulih)</option>
          </select>
        </div>

        <div>
          <label class="block text-slate-400 mb-1 font-semibold">Pesan / Catatan Penanganan & Tindak Lanjut</label>
          <textarea id="edit-inc-message" rows="3" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-xs" ${isPimpinan ? 'disabled' : ''}>${inc.message || ''}</textarea>
        </div>

        <div class="flex items-center space-x-2">
          <input type="checkbox" id="edit-inc-ack" ${inc.acknowledged ? 'checked' : ''} ${isPimpinan ? 'disabled' : ''} class="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-0">
          <label for="edit-inc-ack" class="text-slate-300">Tandai telah dikonfirmasi (Acknowledged Teknisi NOC)</label>
        </div>

        ${!isPimpinan ? `
          <button type="button" onclick="saveIncidentChanges('${inc.id}')" class="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition shadow-md shadow-amber-600/30 flex items-center justify-center">
            <i class="fa-solid fa-floppy-disk mr-1.5"></i> Simpan Perubahan Catatan Insiden
          </button>
        ` : ''}
      </div>
    `;

    document.getElementById('btn-delete-incident').onclick = () => {
      deleteIncident(inc.id);
    };

    openModal('modal-incident-detail');
  } catch (err) {
    showToast('Gagal memuat detail insiden', 'danger');
  }
}

async function saveIncidentChanges(id) {
  if (currentUser.role === 'PIMPINAN') {
    showToast('Hak akses Pimpinan adalah Read-Only', 'danger');
    return;
  }
  const status = document.getElementById('edit-inc-status').value;
  const message = document.getElementById('edit-inc-message').value;
  const acknowledged = document.getElementById('edit-inc-ack').checked;

  try {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, message, acknowledged })
    }).then(r => r.json());

    if (res.success) {
      showToast('Perubahan catatan insiden berhasil disimpan!', 'success');
      closeModal('modal-incident-detail');
      loadAllData();
    } else {
      showToast(res.error || 'Gagal menyimpan perubahan insiden', 'danger');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan saat menyimpan', 'danger');
  }
}

async function deleteIncident(id) {
  if (currentUser.role === 'PIMPINAN') {
    showToast('Hak akses Pimpinan adalah Read-Only', 'danger');
    return;
  }
  if (!confirm('Yakin ingin menghapus catatan log insiden ini?')) return;
  try {
    const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) {
      showToast('Log insiden berhasil dihapus', 'success');
      closeModal('modal-incident-detail');
      loadAllData();
    } else {
      showToast(res.error || 'Gagal menghapus insiden', 'danger');
    }
  } catch (err) {
    showToast('Terjadi kesalahan jaringan', 'danger');
  }
}

// ==================== USER MANAGEMENT CRUD (RBAC) ====================
let allUsersData = [];

async function openUserManagementModal() {
  openModal('modal-user-management');
  const container = document.getElementById('users-list-container');
  container.innerHTML = `<div class="py-8 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin text-xl mb-2"></i><p>Memuat daftar pengguna...</p></div>`;

  try {
    const res = await fetch('/api/auth/users').then(r => r.json());
    if (res.success) {
      allUsersData = res.data;
      renderUsersList(allUsersData);
    } else {
      container.innerHTML = `<div class="p-4 text-center text-red-400">Gagal memuat pengguna</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div class="p-4 text-center text-red-400">Kesalahan jaringan</div>`;
  }
}

function renderUsersList(users) {
  const container = document.getElementById('users-list-container');
  if (!users || users.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-slate-500">Belum ada akun pengguna terdaftar.</div>`;
    return;
  }

  const isAdmin = currentUser.role === 'ADMIN_NOC';

  container.innerHTML = users.map(u => {
    let roleBadge = 'bg-blue-600/20 text-blue-400 border-blue-500/30';
    if (u.role === 'ADMIN_NOC') roleBadge = 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
    if (u.role === 'PIMPINAN') roleBadge = 'bg-purple-600/20 text-purple-400 border-purple-500/30';

    const isCurrentActive = currentUser.username.toLowerCase() === u.username.toLowerCase();
    const isProtectedDefault = u.username.toLowerCase() === 'admin';

    return `
      <div class="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-base">
            <i class="fa-solid ${u.avatar || 'fa-user'}"></i>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-slate-200 text-sm">${u.name}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadge}">${u.role}</span>
              ${isCurrentActive ? '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">AKUN ANDA</span>' : ''}
            </div>
            <div class="text-xs text-slate-400 font-mono mt-0.5">
              @${u.username} • ${u.email}
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-1.5 self-end sm:self-auto">
          <button onclick="selectUserAccount('${u.username}')" class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg transition" title="Beralih ke Akun Ini">
            <i class="fa-solid fa-arrow-right-to-bracket mr-1"></i> Beralih
          </button>
          ${isAdmin ? `
            <button onclick="openEditUserModal('${u.id}')" class="px-2.5 py-1 text-xs bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded-lg transition" title="Edit Akun Pengguna">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            ${!isProtectedDefault ? `
              <button onclick="deleteUser('${u.id}')" class="px-2.5 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 rounded-lg transition" title="Hapus Pengguna">
                <i class="fa-solid fa-trash"></i>
              </button>
            ` : ''}
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function selectUserAccount(username) {
  const user = allUsersData.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (user) {
    currentUser = { ...user };
    showToast(`Beralih ke akun: ${user.name} (${user.role})`, 'success');
    updateUserUI();
    closeModal('modal-user-management');
  }
}

function openAddUserModal() {
  document.getElementById('modal-user-form-title').innerHTML = `<i class="fa-solid fa-user-plus text-emerald-400 mr-2"></i> Tambah Pengguna Baru`;
  document.getElementById('form-user-crud').reset();
  document.getElementById('user-crud-id').value = '';
  document.getElementById('user-crud-username').disabled = false;
  openModal('modal-user-crud');
}

function openEditUserModal(id) {
  const user = allUsersData.find(u => u.id === id);
  if (!user) {
    showToast('Pengguna tidak ditemukan', 'danger');
    return;
  }
  document.getElementById('modal-user-form-title').innerHTML = `<i class="fa-solid fa-user-pen text-amber-400 mr-2"></i> Edit Data Pengguna`;
  document.getElementById('user-crud-id').value = user.id;
  document.getElementById('user-crud-username').value = user.username;
  document.getElementById('user-crud-username').disabled = true;
  document.getElementById('user-crud-name').value = user.name;
  document.getElementById('user-crud-email').value = user.email;
  document.getElementById('user-crud-role').value = user.role;
  document.getElementById('user-crud-avatar').value = user.avatar || 'fa-user-gear';
  openModal('modal-user-crud');
}

async function handleUserCrudSubmit(e) {
  e.preventDefault();
  if (currentUser.role !== 'ADMIN_NOC') {
    showToast('Hanya Admin NOC yang berwenang mengelola pengguna!', 'danger');
    return;
  }

  const id = document.getElementById('user-crud-id').value;
  const username = document.getElementById('user-crud-username').value.trim();
  const name = document.getElementById('user-crud-name').value.trim();
  const email = document.getElementById('user-crud-email').value.trim();
  const role = document.getElementById('user-crud-role').value;
  const avatar = document.getElementById('user-crud-avatar').value;

  const payload = { username, name, email, role, avatar };

  try {
    let res;
    if (id) {
      res = await fetch(`/api/auth/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());
    } else {
      res = await fetch(`/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());
    }

    if (res.success) {
      showToast(id ? 'Data pengguna berhasil diperbarui!' : 'Pengguna baru berhasil ditambahkan!', 'success');
      closeModal('modal-user-crud');
      openUserManagementModal();
    } else {
      showToast(res.error || 'Gagal memproses data pengguna', 'danger');
    }
  } catch (err) {
    showToast('Kesalahan jaringan', 'danger');
  }
}

async function deleteUser(id) {
  if (currentUser.role !== 'ADMIN_NOC') {
    showToast('Hanya Admin NOC yang berwenang menghapus pengguna!', 'danger');
    return;
  }
  if (!confirm('Yakin ingin menghapus pengguna ini dari sistem UNUGHA?')) return;

  try {
    const res = await fetch(`/api/auth/users/${id}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) {
      showToast('Pengguna berhasil dihapus', 'success');
      openUserManagementModal();
    } else {
      showToast(res.error || 'Gagal menghapus pengguna', 'danger');
    }
  } catch (err) {
    showToast('Kesalahan jaringan saat menghapus', 'danger');
  }
}

// Expose all action handlers globally for HTML inline onclick handlers
window.viewDeviceDetail = viewDeviceDetail;
window.pingSingleDevice = pingSingleDevice;
window.openEditDeviceModal = openEditDeviceModal;
window.deleteDevice = deleteDevice;
window.openAddDeviceModal = () => openModal('modal-add-device');
window.openEditBuildingModal = openEditBuildingModal;
window.deleteBuilding = deleteBuilding;
window.openAddBuildingModal = openAddBuildingModal;
window.filterByBuildingFromMap = filterByBuildingFromMap;
window.switchViewMode = switchViewMode;
window.exportTopologyImage = exportTopologyImage;
window.viewIncidentDetail = viewIncidentDetail;
window.saveIncidentChanges = saveIncidentChanges;
window.deleteIncident = deleteIncident;
window.acknowledgeIncident = acknowledgeIncident;
window.openUserManagementModal = openUserManagementModal;
window.openAddUserModal = openAddUserModal;
window.openEditUserModal = openEditUserModal;
window.deleteUser = deleteUser;
window.selectUserAccount = selectUserAccount;
window.switchUserRole = switchUserRole;
window.openSlaReportModal = openSlaReportModal;
window.printSlaReport = printSlaReport;
window.downloadSlaCsv = downloadSlaCsv;
window.runTerminalPing = runTerminalPing;
window.runTerminalTraceroute = runTerminalTraceroute;
window.triggerDemoFailover = triggerDemoFailover;
window.triggerFullScan = triggerFullScan;
window.openModal = openModal;
window.closeModal = closeModal;
window.loadAllData = loadAllData;
window.openLoginModal = openLoginModal;
window.selectLoginPreset = selectLoginPreset;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleLoginSubmit = handleLoginSubmit;
window.promptSessionExit = promptSessionExit;
window.stayInApp = stayInApp;
window.executeLogout = executeLogout;

// Navbar Dropdown Navigation Helpers
window.toggleDropdown = function(id) {
  const el = document.getElementById(id);
  const allDropdowns = document.querySelectorAll('.nav-dropdown-content');
  allDropdowns.forEach(d => {
    if (d.id !== id) {
      d.classList.remove('show-dropdown');
    }
  });
  if (el) {
    el.classList.toggle('show-dropdown');
  }
};

window.closeAllDropdowns = function() {
  document.querySelectorAll('.nav-dropdown-content').forEach(d => {
    d.classList.remove('show-dropdown');
  });
};

window.scrollToSection = function(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-menu-group')) {
    if (window.closeAllDropdowns) window.closeAllDropdowns();
  }
});

// ==================== PWA & MOBILE APP INSTALLATION ====================
let deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
  });
}

// Listen for beforeinstallprompt event for PWA 1-click install
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  console.log('[PWA] beforeinstallprompt event captured');
  const banner = document.getElementById('banner-install-app');
  if (banner && !sessionStorage.getItem('dismiss_install_banner')) {
    banner.classList.remove('hidden');
  }
});

function triggerPwaInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('Terima kasih! UNUGHA NetWatch sedang dipasang di perangkat Anda', 'success');
        dismissInstallBanner();
      }
      deferredInstallPrompt = null;
    });
  } else {
    showToast('Silakan pilih opsi "Tambahkan ke Layar Utama" (Add to Home Screen) pada menu peramban Anda', 'info');
  }
}

function openDownloadAppModal() {
  openModal('modal-download-app');
}

function dismissInstallBanner() {
  const banner = document.getElementById('banner-install-app');
  if (banner) {
    banner.classList.add('hidden');
    sessionStorage.setItem('dismiss_install_banner', '1');
  }
}

function switchDownloadTab(tab) {
  const tabs = ['android', 'tablet', 'mac', 'windows'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
    if (t === tab) {
      if (btn) {
        btn.className = 'py-2 px-3 rounded-lg bg-emerald-600 text-white transition flex items-center justify-center space-x-1.5 shadow';
      }
      if (content) content.classList.remove('hidden');
    } else {
      if (btn) {
        btn.className = 'py-2 px-3 rounded-lg text-slate-400 hover:text-white transition flex items-center justify-center space-x-1.5';
      }
      if (content) content.classList.add('hidden');
    }
  });
}

window.openDownloadAppModal = openDownloadAppModal;
window.triggerPwaInstall = triggerPwaInstall;
window.dismissInstallBanner = dismissInstallBanner;
window.switchDownloadTab = switchDownloadTab;



