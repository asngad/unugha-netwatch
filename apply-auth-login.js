const fs = require('fs');
const path = 'C:/monitoring_unugha/public/js/app.js';
let content = fs.readFileSync(path, 'utf8');

// 1. In DOMContentLoaded, restore session
const oldDomLoaded = `document.addEventListener('DOMContentLoaded', () => {`;
const newDomLoaded = `document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('unugha_auth_user') || sessionStorage.getItem('unugha_auth_user');
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Session restore error:', e);
  }`;

if (content.includes(oldDomLoaded) && !content.includes('unugha_auth_user')) {
  content = content.replace(oldDomLoaded, newDomLoaded);
  console.log('Added session restore in DOMContentLoaded');
}

// 2. Update updateUserUI
const oldUpdateUserUI = /function updateUserUI\(\) \{[\s\S]*?renderDevicesTable\(currentDevices\);\r?\n\}/m;
const newUpdateUserUI = `function updateUserUI() {
  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-display-role');
  const statusEl = document.getElementById('session-status-text');
  const headerBadge = document.getElementById('session-header-badge');
  const confirmUserEl = document.getElementById('session-confirm-user');

  if (nameEl) nameEl.textContent = currentUser.name;
  if (roleEl) roleEl.textContent = currentUser.role;

  if (confirmUserEl) {
    confirmUserEl.textContent = \`\${currentUser.name} (\${currentUser.role})\`;
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
}`;

if (oldUpdateUserUI.test(content)) {
  content = content.replace(oldUpdateUserUI, newUpdateUserUI);
  console.log('Updated updateUserUI with session status & guest handling');
} else {
  console.log('oldUpdateUserUI pattern not matched');
}

// 3. Add Login & Session handlers
const authHandlers = `
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
      showToast(\`Login berhasil! Selamat datang, \${res.user.name}\`, 'success');
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
    confirmUserEl.textContent = \`\${currentUser.name} (\${currentUser.role})\`;
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
`;

if (!content.includes('function openLoginModal')) {
  // Insert before setupEventListeners
  content = content.replace('function setupEventListeners() {', authHandlers + '\nfunction setupEventListeners() {');
  console.log('Inserted authHandlers');
}

// 4. In setupEventListeners, attach form-login-admin
const oldSetupEvents = 'function setupEventListeners() {\n  document.getElementById(\'btn-scan\')';
const newSetupEvents = `function setupEventListeners() {
  const formLogin = document.getElementById('form-login-admin');
  if (formLogin) {
    formLogin.addEventListener('submit', handleLoginSubmit);
  }

  document.getElementById('btn-scan')`;

if (content.includes(oldSetupEvents)) {
  content = content.replace(oldSetupEvents, newSetupEvents);
  console.log('Attached form-login-admin in setupEventListeners');
}

// 5. Expose globally
const oldExports = 'window.loadAllData = loadAllData;';
const newExports = `window.loadAllData = loadAllData;
window.openLoginModal = openLoginModal;
window.selectLoginPreset = selectLoginPreset;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleLoginSubmit = handleLoginSubmit;
window.promptSessionExit = promptSessionExit;
window.stayInApp = stayInApp;
window.executeLogout = executeLogout;`;

if (content.includes(oldExports) && !content.includes('window.openLoginModal')) {
  content = content.replace(oldExports, newExports);
  console.log('Exposed auth functions globally');
}

fs.writeFileSync(path, content, 'utf8');
console.log('app.js updated successfully with full Auth & Session management!');
