const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const expectedIds = [
  'btn-scan',
  'btn-toggle-sound',
  'ws-indicator',
  'ws-status-text',
  'last-sync-time',
  'btn-demo-failover',
  'btn-add-device-modal',
  'user-display-name',
  'user-display-role',
  'dropdown-dashboard',
  'dropdown-topology',
  'dropdown-setting',
  'dropdown-admin',
  'stat-total',
  'stat-up',
  'stat-warning',
  'stat-down',
  'stat-latency',
  'stat-sla',
  'bandwidth-chart',
  'topology-canvas',
  'devices-tbody',
  'incidents-container',
  'form-settings',
  'modal-login-admin',
  'modal-session-confirm',
  'form-login-admin',
  'login-username',
  'login-password',
  'login-remember',
  'btn-login-submit',
  'session-confirm-user',
  'session-status-text',
  'session-header-badge'
];

let allFound = true;
for (const id of expectedIds) {
  if (!html.includes(`id="${id}"`)) {
    console.log('MISSING ID:', id);
    allFound = false;
  }
}
if (allFound) {
  console.log('ALL EXPECTED DOM IDS VERIFIED PRESENT IN index.html!');
}
