const fs = require('fs');
const path = require('path');

const slidesDir = path.join(__dirname, 'public', 'slides');
if (!fs.existsSync(slidesDir)) {
  fs.mkdirSync(slidesDir, { recursive: true });
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function svgTemplate(title, slideNumber, contentXml) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap');
      text { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .mono { font-family: 'JetBrains Mono', monospace; }
    </style>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1920" y2="1080" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0B1120" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#38BDF8" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E293B" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.9" />
    </linearGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="1920" height="1080" fill="url(#bgGrad)" />

  <!-- Subtle Grid Accent -->
  <g opacity="0.04" stroke="#FFFFFF" stroke-width="1">
    <line x1="0" y1="180" x2="1920" y2="180" />
    <line x1="0" y1="360" x2="1920" y2="360" />
    <line x1="0" y1="540" x2="1920" y2="540" />
    <line x1="0" y1="720" x2="1920" y2="720" />
    <line x1="0" y1="900" x2="1920" y2="900" />
    <line x1="320" y1="0" x2="320" y2="1080" />
    <line x1="640" y1="0" x2="640" y2="1080" />
    <line x1="960" y1="0" x2="960" y2="1080" />
    <line x1="1280" y1="0" x2="1280" y2="1080" />
    <line x1="1600" y1="0" x2="1600" y2="1080" />
  </g>

  <!-- Content Layer -->
  ${contentXml}

  <!-- Footer -->
  <line x1="100" y1="980" x2="1820" y2="980" stroke="#334155" stroke-width="1.5" />
  <text x="100" y="1020" fill="#64748B" font-size="16" font-weight="600">UNUGHA NetWatch • Sistem Monitoring Jaringan Kampus UNUGHA Cilacap</text>
  <text x="1820" y="1020" fill="#10B981" font-size="16" font-weight="700" text-anchor="end">Slide ${slideNumber} / 10</text>
</svg>`;
}

// ==========================================
// SLIDE 1: COVER
// ==========================================
const s1 = svgTemplate('Cover', 1, `
  <!-- Header Badge -->
  <rect x="100" y="120" width="460" height="42" rx="21" fill="#10B981" fill-opacity="0.15" stroke="#10B981" stroke-width="1.5" />
  <circle cx="124" cy="141" r="6" fill="#10B981" />
  <text x="142" y="147" fill="#34D399" font-size="15" font-weight="700" letter-spacing="1">DEMO SISTEM &amp; SIDANG TUGAS AKHIR</text>

  <!-- Title & Subtitle -->
  <text x="100" y="270" fill="#FFFFFF" font-size="76" font-weight="800" letter-spacing="-1">UNUGHA NetWatch</text>
  <text x="100" y="340" fill="url(#emeraldGrad)" font-size="34" font-weight="700">Sistem Pemantauan Status Perangkat &amp; Inventaris Jaringan Kampus</text>
  <text x="100" y="390" fill="#94A3B8" font-size="22" font-weight="500">Studi Kasus: Infrastruktur Jaringan NOC Gedung Rektorat &amp; Kampus UNUGHA Cilacap</text>

  <!-- Presenter Card -->
  <rect x="100" y="470" width="1720" height="360" rx="24" fill="url(#cardGrad)" stroke="#334155" stroke-width="2" />
  
  <g transform="translate(160, 530)">
    <!-- Column 1 -->
    <text x="0" y="30" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1">PENYAJI / PENGEMBANG</text>
    <text x="0" y="75" fill="#FFFFFF" font-size="32" font-weight="800">Asngad</text>
    <text x="0" y="115" fill="#94A3B8" font-size="18" font-weight="500">Tim IT &amp; Administrator Jaringan Kampus</text>
    <text x="0" y="145" fill="#64748B" font-size="16" font-weight="500">Universitas Nahdlatul Ulama Al Ghazali</text>

    <!-- Divider -->
    <line x1="480" y1="10" x2="480" y2="230" stroke="#334155" stroke-width="1.5" />

    <!-- Column 2 -->
    <text x="540" y="30" fill="#38BDF8" font-size="16" font-weight="700" letter-spacing="1">INSTITUSI &amp; FAKULTAS</text>
    <text x="540" y="75" fill="#FFFFFF" font-size="28" font-weight="700">UNUGHA Cilacap</text>
    <text x="540" y="115" fill="#94A3B8" font-size="18" font-weight="500">Fakultas MIPA &amp; Ilmu Komputer</text>
    <text x="540" y="145" fill="#64748B" font-size="16" font-weight="500">Pusat Data &amp; Jaringan Kampus</text>

    <!-- Divider -->
    <line x1="1040" y1="10" x2="1040" y2="230" stroke="#334155" stroke-width="1.5" />

    <!-- Column 3 -->
    <text x="1100" y="30" fill="#F59E0B" font-size="16" font-weight="700" letter-spacing="1">ARSITEKTUR &amp; PLATFORM</text>
    <text x="1100" y="70" fill="#FFFFFF" font-size="20" font-weight="600">• Node.js Backend &amp; Socket.io WebSocket</text>
    <text x="1100" y="105" fill="#FFFFFF" font-size="20" font-weight="600">• 4 Multi-WAN ISP Bandwidth Telemetry</text>
    <text x="1100" y="140" fill="#FFFFFF" font-size="20" font-weight="600">• Responsive PWA &amp; Standalone Android APK</text>
    <text x="1100" y="175" fill="#FFFFFF" font-size="20" font-weight="600">• 100% Jest Unit Test &amp; ESLint Flat Config</text>
  </g>
`);

// ==========================================
// SLIDE 2: LATAR BELAKANG
// ==========================================
const s2 = svgTemplate('Latar Belakang', 2, `
  <!-- Slide Header -->
  <text x="100" y="130" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1.5">PENDAHULUAN</text>
  <text x="100" y="180" fill="#FFFFFF" font-size="44" font-weight="800">Latar Belakang &amp; Permasalahan Riil Kampus</text>

  <!-- 3 Problem Cards -->
  <!-- Card 1 -->
  <rect x="100" y="240" width="540" height="660" rx="20" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="1.5" />
  <rect x="100" y="240" width="540" height="8" rx="4" fill="#38BDF8" />
  <text x="140" y="320" fill="#38BDF8" font-size="24" font-weight="800">🌐 4 ISP Multi-WAN Kompleks</text>
  <text x="140" y="380" fill="#F8FAFC" font-size="18" font-weight="600">Total Bandwidth: 1050 Mbps</text>
  <text x="140" y="430" fill="#CBD5E1" font-size="17" font-weight="400">
    <tspan x="140" dy="0">UNUGHA melanggan 4 ISP simultan:</tspan>
    <tspan x="140" dy="32">• Citra (100M Dedicated FO)</tspan>
    <tspan x="140" dy="32">• Telkom Indibiz (200M Fiber)</tspan>
    <tspan x="140" dy="32">• Starlink (250M Low Earth Orbit)</tspan>
    <tspan x="140" dy="32">• Starlite (500M Dedicated Utama)</tspan>
    <tspan x="140" dy="48">Masalah:</tspan>
    <tspan x="140" dy="32">Tanpa sistem monitoring, tim IT kesulitan</tspan>
    <tspan x="140" dy="32">mengetahui jalur failover mana yang putus</tspan>
    <tspan x="140" dy="32">atau mengalami packet loss parah.</tspan>
  </text>

  <!-- Card 2 -->
  <rect x="690" y="240" width="540" height="660" rx="20" fill="url(#cardGrad)" stroke="#F59E0B" stroke-width="1.5" />
  <rect x="690" y="240" width="540" height="8" rx="4" fill="#F59E0B" />
  <text x="730" y="320" fill="#F59E0B" font-size="24" font-weight="800">⚠️ Respon Insiden Reaktif</text>
  <text x="730" y="380" fill="#F8FAFC" font-size="18" font-weight="600">Terlambat 30 – 60 Menit</text>
  <text x="730" y="430" fill="#CBD5E1" font-size="17" font-weight="400">
    <tspan x="730" dy="0">Insiden padamnya switch atau access</tspan>
    <tspan x="730" dy="32">point di ruang kuliah (Gedung GH1,</tspan>
    <tspan x="730" dy="32">GH2, FMIKOM, &amp; Perpus) baru diketahui</tspan>
    <tspan x="730" dy="32">setelah ada komplain dosen / mahasiswa.</tspan>
    <tspan x="730" dy="48">Dampak:</tspan>
    <tspan x="730" dy="32">• Layanan SIAKAD &amp; CBT terganggu</tspan>
    <tspan x="730" dy="32">• Teknisi butuh waktu lama untuk isolasi</tspan>
    <tspan x="730" dy="32">  lokasi perangkat yang bermasalah.</tspan>
  </text>

  <!-- Card 3 -->
  <rect x="1280" y="240" width="540" height="660" rx="20" fill="url(#cardGrad)" stroke="#10B981" stroke-width="1.5" />
  <rect x="1280" y="240" width="540" height="8" rx="4" fill="#10B981" />
  <text x="1320" y="320" fill="#10B981" font-size="24" font-weight="800">📋 Inventarisasi Terpisah</text>
  <text x="1320" y="380" fill="#F8FAFC" font-size="18" font-weight="600">Data Manual &amp; Tidak Aktual</text>
  <text x="1320" y="430" fill="#CBD5E1" font-size="17" font-weight="400">
    <tspan x="1320" dy="0">Pencatatan 28 perangkat (Ruijie Core,</tspan>
    <tspan x="1320" dy="32">Switch PoE, AP Wi-Fi 6) tercecer di</tspan>
    <tspan x="1320" dy="32">catatan spreadsheet manual.</tspan>
    <tspan x="1320" dy="48">Kebutuhan Solusi:</tspan>
    <tspan x="1320" dy="32">Diperlukan satu portal NOC terpadu</tspan>
    <tspan x="1320" dy="32">yang menggabungkan inventaris dengan</tspan>
    <tspan x="1320" dy="32">live ping, traceroute, dan audit trail.</tspan>
  </text>
`);

// ==========================================
// SLIDE 3: RUMUSAN MASALAH & TUJUAN
// ==========================================
const s3 = svgTemplate('Rumusan & Tujuan', 3, `
  <text x="100" y="130" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1.5">TINJAUAN STRATEGIS</text>
  <text x="100" y="180" fill="#FFFFFF" font-size="44" font-weight="800">Rumusan Masalah &amp; Tujuan Penelitian</text>

  <!-- Left: Rumusan Masalah -->
  <rect x="100" y="240" width="830" height="660" rx="20" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="1.5" />
  <text x="150" y="320" fill="#38BDF8" font-size="26" font-weight="800">🎯 Rumusan Masalah</text>
  
  <g transform="translate(150, 380)">
    <circle cx="20" cy="20" r="18" fill="#38BDF8" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1.5" />
    <text x="20" y="26" fill="#38BDF8" font-size="16" font-weight="800" text-anchor="middle">1</text>
    <text x="60" y="20" fill="#F8FAFC" font-size="18" font-weight="600">
      <tspan x="60" dy="0">Bagaimana merancang sistem monitoring real-time</tspan>
      <tspan x="60" dy="28">yang mendeteksi kondisi perangkat jaringan kampus</tspan>
      <tspan x="60" dy="28">dengan interval cepat (&lt; 15 detik)?</tspan>
    </text>

    <circle cx="20" cy="140" r="18" fill="#38BDF8" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1.5" />
    <text x="20" y="146" fill="#38BDF8" font-size="16" font-weight="800" text-anchor="middle">2</text>
    <text x="60" y="140" fill="#F8FAFC" font-size="18" font-weight="600">
      <tspan x="60" dy="0">Bagaimana mengintegrasikan manajemen inventaris</tspan>
      <tspan x="60" dy="28">perangkat langsung dengan fitur pengujian diagnostik</tspan>
      <tspan x="60" dy="28">(Quick Ping &amp; Traceroute)?</tspan>
    </text>

    <circle cx="20" cy="260" r="18" fill="#38BDF8" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1.5" />
    <text x="20" y="266" fill="#38BDF8" font-size="16" font-weight="800" text-anchor="middle">3</text>
    <text x="60" y="260" fill="#F8FAFC" font-size="18" font-weight="600">
      <tspan x="60" dy="0">Bagaimana menyajikan visualisasi bandwidth 4 ISP</tspan>
      <tspan x="60" dy="28">serta menyediakan aplikasi multiplatform</tspan>
      <tspan x="60" dy="28">(Web NOC, PWA, dan Android APK)?</tspan>
    </text>
  </g>

  <!-- Right: Tujuan Penelitian -->
  <rect x="990" y="240" width="830" height="660" rx="20" fill="url(#cardGrad)" stroke="#10B981" stroke-width="1.5" />
  <text x="1040" y="320" fill="#10B981" font-size="26" font-weight="800">🏆 Tujuan Sistem UNUGHA NetWatch</text>

  <g transform="translate(1040, 380)">
    <circle cx="20" cy="20" r="18" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1.5" />
    <text x="20" y="26" fill="#10B981" font-size="16" font-weight="800" text-anchor="middle">✓</text>
    <text x="60" y="15" fill="#34D399" font-size="18" font-weight="700">Visibilitas NOC Terpusat</text>
    <text x="60" y="42" fill="#CBD5E1" font-size="16">Memantau 28 node perangkat kampus otomatis setiap siklus 15 detik.</text>

    <circle cx="20" cy="110" r="18" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1.5" />
    <text x="20" y="116" fill="#10B981" font-size="16" font-weight="800" text-anchor="middle">✓</text>
    <text x="60" y="105" fill="#34D399" font-size="18" font-weight="700">Manajemen Insiden &amp; SLA</text>
    <text x="60" y="132" fill="#CBD5E1" font-size="16">Mencatat riwayat downtime, acknowledge insiden, dan log audit admin.</text>

    <circle cx="20" cy="200" r="18" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1.5" />
    <text x="20" y="206" fill="#10B981" font-size="16" font-weight="800" text-anchor="middle">✓</text>
    <text x="60" y="195" fill="#34D399" font-size="18" font-weight="700">CRUD Inventaris Lengkap</text>
    <text x="60" y="222" fill="#CBD5E1" font-size="16">Pengelolaan aset dinamis dengan validasi IP, MAC, dan Lokasi Gedung.</text>

    <circle cx="20" cy="290" r="18" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1.5" />
    <text x="20" y="296" fill="#10B981" font-size="16" font-weight="800" text-anchor="middle">✓</text>
    <text x="60" y="285" fill="#34D399" font-size="18" font-weight="700">Akses Fleksibel Multi-Platform</text>
    <text x="60" y="312" fill="#CBD5E1" font-size="16">Dapat diakses di PC, Tablet, dan diunduh sebagai file APK Android.</text>
  </g>
`);

// ==========================================
// SLIDE 4: TOPOLOGI KAMPUS
// ==========================================
const s4 = svgTemplate('Topologi Jaringan', 4, `
  <text x="100" y="130" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1.5">ARSITEKTUR INFRASTRUKTUR</text>
  <text x="100" y="180" fill="#FFFFFF" font-size="44" font-weight="800">Topologi Jaringan Multi-WAN Kampus UNUGHA</text>

  <!-- 4 ISP Boxes -->
  <g transform="translate(100, 240)">
    <rect x="0" y="0" width="395" height="130" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="1.5" />
    <text x="30" y="45" fill="#FFFFFF" font-size="20" font-weight="800">ISP Citra</text>
    <text x="30" y="75" fill="#10B981" font-size="16" font-weight="700">100 Mbps Dedicated FO</text>
    <text x="30" y="105" fill="#94A3B8" font-size="14">Ping: 1ms • Uptime 99.75%</text>

    <rect x="440" y="0" width="395" height="130" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="1.5" />
    <text x="470" y="45" fill="#FFFFFF" font-size="20" font-weight="800">ISP Indibiz</text>
    <text x="470" y="75" fill="#10B981" font-size="16" font-weight="700">200 Mbps Telkom FO</text>
    <text x="470" y="105" fill="#94A3B8" font-size="14">Ping: 1ms • Uptime 99.85%</text>

    <rect x="880" y="0" width="395" height="130" rx="16" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="1.5" />
    <text x="910" y="45" fill="#FFFFFF" font-size="20" font-weight="800">ISP Starlink (LEO)</text>
    <text x="910" y="75" fill="#38BDF8" font-size="16" font-weight="700">250 Mbps Satelit Rendah</text>
    <text x="910" y="105" fill="#94A3B8" font-size="14">Ping: 36ms • Uptime 99.41%</text>

    <rect x="1320" y="0" width="400" height="130" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="1.5" />
    <text x="1350" y="45" fill="#FFFFFF" font-size="20" font-weight="800">ISP Starlite Dedicated</text>
    <text x="1350" y="75" fill="#10B981" font-size="16" font-weight="700">500 Mbps Backbone Utama</text>
    <text x="1350" y="105" fill="#94A3B8" font-size="14">Ping: 69ms • Uptime 99.64%</text>
  </g>

  <!-- Core Router Box -->
  <rect x="100" y="420" width="1720" height="190" rx="20" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="2" />
  <text x="150" y="475" fill="#38BDF8" font-size="24" font-weight="800">CORE GATEWAY &amp; DISTRIBUTION LAYER (RACK SERVER NOC REKTORAT)</text>
  <text x="150" y="525" fill="#FFFFFF" font-size="19" font-weight="600">
    <tspan x="150" dy="0">• Core Gateway: Ruijie Reyee RG-EG1510XS Multi-WAN (192.168.1.1) - Load Balancing &amp; Failover Policy</tspan>
    <tspan x="150" dy="34">• Distribution Switch: Ruijie RG-NBS3100-24GT4SFP (192.168.1.2) - Managed 24-Port SFP Uplink Backbone</tspan>
    <tspan x="150" dy="34">• Server Monitoring: UNUGHA NetWatch Service (Node.js Express + Socket.io WebSocket Provider)</tspan>
  </text>

  <!-- 4 Campus Distribution Areas -->
  <g transform="translate(100, 660)">
    <rect x="0" y="0" width="395" height="230" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <text x="30" y="45" fill="#38BDF8" font-size="20" font-weight="700">Gedung Rektorat</text>
    <text x="30" y="85" fill="#CBD5E1" font-size="15">• Server NOC UNUGHA</text>
    <text x="30" y="115" fill="#CBD5E1" font-size="15">• Ruang Rektor &amp; BAAK</text>
    <text x="30" y="145" fill="#CBD5E1" font-size="15">• Keuangan &amp; LPM</text>
    <text x="30" y="185" fill="#10B981" font-size="14" font-weight="600">AP: RG-RAP2260(E)</text>

    <rect x="440" y="0" width="395" height="230" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <text x="470" y="45" fill="#10B981" font-size="20" font-weight="700">Gedung Hijau 1 (GH1)</text>
    <text x="470" y="85" fill="#CBD5E1" font-size="15">• Lantai 1 Ruang Kuliah</text>
    <text x="470" y="115" fill="#CBD5E1" font-size="15">• Lantai 2 Sayap B</text>
    <text x="470" y="145" fill="#CBD5E1" font-size="15">• Lantai 3 Aula Utama</text>
    <text x="470" y="185" fill="#10B981" font-size="14" font-weight="600">AP Wi-Fi 6 High Density</text>

    <rect x="880" y="0" width="395" height="230" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <text x="910" y="45" fill="#F59E0B" font-size="20" font-weight="700">Gedung Hijau 2 (GH2)</text>
    <text x="910" y="85" fill="#CBD5E1" font-size="15">• Lantai 1 Perkuliahan</text>
    <text x="910" y="115" fill="#CBD5E1" font-size="15">• Lantai 2 Perkuliahan</text>
    <text x="910" y="145" fill="#CBD5E1" font-size="15">• Lantai 3 Perkuliahan</text>
    <text x="910" y="185" fill="#10B981" font-size="14" font-weight="600">AP Wi-Fi 6 High Density</text>

    <rect x="1320" y="0" width="400" height="230" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <text x="1350" y="45" fill="#A855F7" font-size="20" font-weight="700">FMIKOM &amp; Perpus</text>
    <text x="1350" y="85" fill="#CBD5E1" font-size="15">• Lab Komputer Jaringan</text>
    <text x="1350" y="115" fill="#CBD5E1" font-size="15">• Ruang Dosen &amp; Prodi</text>
    <text x="1350" y="145" fill="#CBD5E1" font-size="15">• Perpustakaan Lt 1 &amp; 2</text>
    <text x="1350" y="185" fill="#10B981" font-size="14" font-weight="600">AP Wi-Fi 6 Dedicated</text>
  </g>
`);

// ==========================================
// SLIDE 5: 4 PILAR FITUR
// ==========================================
const s5 = svgTemplate('Fitur Utama', 5, `
  <text x="100" y="130" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1.5">FITUR UNGGULAN</text>
  <text x="100" y="180" fill="#FFFFFF" font-size="44" font-weight="800">4 Pilar Utama Sistem UNUGHA NetWatch</text>

  <!-- 4 Cards Grid -->
  <g transform="translate(100, 240)">
    <!-- Box 1 -->
    <rect x="0" y="0" width="830" height="310" rx="20" fill="url(#cardGrad)" stroke="#10B981" stroke-width="1.5" />
    <text x="50" y="65" fill="#10B981" font-size="24" font-weight="800">⚡ 1. Real-Time Ping Engine &amp; SLA Tracking</text>
    <text x="50" y="115" fill="#CBD5E1" font-size="17" font-weight="400">
      <tspan x="50" dy="0">• Menjalankan siklus ICMP/TCP ping otomatis ke 28 target setiap 15 detik.</tspan>
      <tspan x="50" dy="32">• Menghitung latensi aktual milidetik (ms), packet loss %, dan SLA uptime.</tspan>
      <tspan x="50" dy="32">• Pembaruan status instan ke dashboard klien via siaran WebSocket Socket.io.</tspan>
    </text>

    <!-- Box 2 -->
    <rect x="890" y="0" width="830" height="310" rx="20" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="1.5" />
    <text x="940" y="65" fill="#38BDF8" font-size="24" font-weight="800">📦 2. Manajemen Inventaris &amp; Quick Ping</text>
    <text x="940" y="115" fill="#CBD5E1" font-size="17" font-weight="400">
      <tspan x="940" dy="0">• Modul CRUD lengkap (Tambah, Edit, Hapus, Filter Gedung &amp; Kategori).</tspan>
      <tspan x="940" dy="32">• Validasi ketat IP Address, MAC Address, Vendor, dan Lokasi Kampus.</tspan>
      <tspan x="940" dy="32">• Tombol uji cepat "Quick Ping" dan visualisasi jalur multi-hop Traceroute.</tspan>
    </text>

    <!-- Box 3 -->
    <rect x="0" y="350" width="830" height="310" rx="20" fill="url(#cardGrad)" stroke="#F59E0B" stroke-width="1.5" />
    <text x="50" y="415" fill="#F59E0B" font-size="24" font-weight="800">🚨 3. Manajemen Insiden &amp; Audit Trail</text>
    <text x="50" y="465" fill="#CBD5E1" font-size="17" font-weight="400">
      <tspan x="50" dy="0">• Otomatis membuat tiket insiden saat perangkat terdeteksi DOWN.</tspan>
      <tspan x="50" dy="32">• Aksi Acknowledge oleh teknisi untuk menandai status perbaikan.</tspan>
      <tspan x="50" dy="32">• Pencatatan riwayat audit lengkap (siapa yang login, ubah data, hapus data).</tspan>
    </text>

    <!-- Box 4 -->
    <rect x="890" y="350" width="830" height="310" rx="20" fill="url(#cardGrad)" stroke="#A855F7" stroke-width="1.5" />
    <text x="940" y="415" fill="#A855F7" font-size="24" font-weight="800">📱 4. Multi-Platform PWA &amp; Standalone APK</text>
    <text x="940" y="465" fill="#CBD5E1" font-size="17" font-weight="400">
      <tspan x="940" dy="0">• Tampilan responsif optimal di monitor NOC, laptop, tablet, dan smartphone.</tspan>
      <tspan x="940" dy="32">• Dukungan Progressive Web App (PWA) dengan service worker offline.</tspan>
      <tspan x="940" dy="32">• Tersedia file unduhan APK Android mandiri dengan modal scan QR Code.</tspan>
    </text>
  </g>
`);

// ==========================================
// SLIDE 6: KUALITAS KODE & TEST
// ==========================================
const s6 = svgTemplate('Pengujian Sistem', 6, `
  <text x="100" y="130" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1.5">QUALITY ASSURANCE</text>
  <text x="100" y="180" fill="#FFFFFF" font-size="44" font-weight="800">Jaminan Kualitas Kode &amp; Metodologi Pengujian</text>

  <!-- 3 Verification Cards -->
  <g transform="translate(100, 240)">
    <!-- Card 1 -->
    <rect x="0" y="0" width="540" height="660" rx="20" fill="url(#cardGrad)" stroke="#10B981" stroke-width="2" />
    <rect x="40" y="40" width="130" height="36" rx="18" fill="#10B981" fill-opacity="0.2" />
    <text x="105" y="64" fill="#34D399" font-size="14" font-weight="800" text-anchor="middle">100% PASS</text>
    <text x="40" y="130" fill="#FFFFFF" font-size="26" font-weight="800">🧪 Jest Unit Testing</text>
    <text x="40" y="170" fill="#34D399" font-size="15" font-weight="600" class="mono">npm run test:coverage</text>
    <text x="40" y="230" fill="#CBD5E1" font-size="16" font-weight="400">
      <tspan x="40" dy="0">• 10 Test Suites Lolos 100%</tspan>
      <tspan x="40" dy="32">• 38 Unit Tests Terverifikasi</tspan>
      <tspan x="40" dy="48">Modul Teruji:</tspan>
      <tspan x="40" dy="30">1. Auth Controller &amp; Session</tspan>
      <tspan x="40" dy="28">2. Device CRUD &amp; Validation</tspan>
      <tspan x="40" dy="28">3. Incident Management SLA</tspan>
      <tspan x="40" dy="28">4. Bandwidth Aggregation</tspan>
      <tspan x="40" dy="28">5. Hardware Telemetry</tspan>
      <tspan x="40" dy="28">6. Ping Engine &amp; Packet Loss</tspan>
      <tspan x="40" dy="28">7. Socket.io Event Broadcast</tspan>
      <tspan x="40" dy="28">8. Database Engine &amp; Seeds</tspan>
    </text>

    <!-- Card 2 -->
    <rect x="590" y="0" width="540" height="660" rx="20" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="2" />
    <rect x="630" y="40" width="130" height="36" rx="18" fill="#38BDF8" fill-opacity="0.2" />
    <text x="695" y="64" fill="#38BDF8" font-size="14" font-weight="800" text-anchor="middle">0 ERRORS</text>
    <text x="630" y="130" fill="#FFFFFF" font-size="26" font-weight="800">🔍 ESLint v10 Flat</text>
    <text x="630" y="170" fill="#38BDF8" font-size="15" font-weight="600" class="mono">npm run lint</text>
    <text x="630" y="230" fill="#CBD5E1" font-size="16" font-weight="400">
      <tspan x="630" dy="0">• Standar Clean Code JavaScript</tspan>
      <tspan x="630" dy="32">• 0 Syntax Error &amp; 0 Warning</tspan>
      <tspan x="630" dy="48">Pemeriksaan Ketat:</tspan>
      <tspan x="630" dy="30">• Pencegahan memory leak pada</tspan>
      <tspan x="630" dy="28">  listener WebSocket event</tspan>
      <tspan x="630" dy="28">• Penanganan async/await safe</tspan>
      <tspan x="630" dy="28">• Pembersihan unused variables</tspan>
      <tspan x="630" dy="28">• Standar penamaan camelCase</tspan>
    </text>

    <!-- Card 3 -->
    <rect x="1180" y="0" width="540" height="660" rx="20" fill="url(#cardGrad)" stroke="#F59E0B" stroke-width="2" />
    <rect x="1220" y="40" width="140" height="36" rx="18" fill="#F59E0B" fill-opacity="0.2" />
    <text x="1290" y="64" fill="#F59E0B" font-size="14" font-weight="800" text-anchor="middle">0 TYPE ERRORS</text>
    <text x="1220" y="130" fill="#FFFFFF" font-size="26" font-weight="800">🛡️ TypeScript Compiler</text>
    <text x="1220" y="170" fill="#F59E0B" font-size="15" font-weight="600" class="mono">npm run typecheck</text>
    <text x="1220" y="230" fill="#CBD5E1" font-size="16" font-weight="400">
      <tspan x="1220" dy="0">• Type checking via JSDoc strict</tspan>
      <tspan x="1220" dy="32">• Verifikasi skema model data</tspan>
      <tspan x="1220" dy="48">Proteksi Integritas:</tspan>
      <tspan x="1220" dy="30">• Pencegahan null pointer pada</tspan>
      <tspan x="1220" dy="28">  kalkulasi latensi &amp; uptime</tspan>
      <tspan x="1220" dy="28">• Integritas format JSON database</tspan>
      <tspan x="1220" dy="28">• Type safety pada API response</tspan>
    </text>
  </g>
`);

// ==========================================
// SLIDE 7: TELEMETRI & HASIL EVALUASI
// ==========================================
const s7 = svgTemplate('Hasil & Evaluasi', 7, `
  <text x="100" y="130" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1.5">DATA HASIL PENGUJIAN</text>
  <text x="100" y="180" fill="#FFFFFF" font-size="44" font-weight="800">Telemetri Performa Aktual 4 ISP UNUGHA</text>

  <!-- Telemetry Table -->
  <g transform="translate(100, 240)">
    <!-- Table Header -->
    <rect x="0" y="0" width="1720" height="60" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
    <text x="40" y="38" fill="#FFFFFF" font-size="17" font-weight="700">Nama Penyedia ISP</text>
    <text x="420" y="38" fill="#FFFFFF" font-size="17" font-weight="700">Kapasitas Pipa</text>
    <text x="740" y="38" fill="#FFFFFF" font-size="17" font-weight="700">Rata-rata Latensi</text>
    <text x="1100" y="38" fill="#FFFFFF" font-size="17" font-weight="700">Uptime SLA %</text>
    <text x="1460" y="38" fill="#FFFFFF" font-size="17" font-weight="700">Status Jalur</text>

    <!-- Row 1: Citra -->
    <rect x="0" y="75" width="1720" height="65" rx="10" fill="url(#cardGrad)" stroke="#334155" stroke-width="1" />
    <text x="40" y="115" fill="#FFFFFF" font-size="18" font-weight="700">ISP Citra</text>
    <text x="420" y="115" fill="#CBD5E1" font-size="17">100 Mbps (FO Dedicated)</text>
    <text x="740" y="115" fill="#10B981" font-size="19" font-weight="800" class="mono">1 ms</text>
    <text x="1100" y="115" fill="#CBD5E1" font-size="17">99.75%</text>
    <rect x="1460" y="90" width="120" height="35" rx="6" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1" />
    <text x="1520" y="113" fill="#34D399" font-size="14" font-weight="800" text-anchor="middle">UP (Aktif)</text>

    <!-- Row 2: Indibiz -->
    <rect x="0" y="150" width="1720" height="65" rx="10" fill="url(#cardGrad)" stroke="#334155" stroke-width="1" />
    <text x="40" y="190" fill="#FFFFFF" font-size="18" font-weight="700">ISP Telkom Indibiz</text>
    <text x="420" y="190" fill="#CBD5E1" font-size="17">200 Mbps (Fiber Optic)</text>
    <text x="740" y="190" fill="#10B981" font-size="19" font-weight="800" class="mono">1 ms</text>
    <text x="1100" y="190" fill="#CBD5E1" font-size="17">99.85%</text>
    <rect x="1460" y="165" width="120" height="35" rx="6" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1" />
    <text x="1520" y="188" fill="#34D399" font-size="14" font-weight="800" text-anchor="middle">UP (Aktif)</text>

    <!-- Row 3: Starlink -->
    <rect x="0" y="225" width="1720" height="65" rx="10" fill="url(#cardGrad)" stroke="#334155" stroke-width="1" />
    <text x="40" y="265" fill="#FFFFFF" font-size="18" font-weight="700">ISP Starlink (LEO Satelit)</text>
    <text x="420" y="265" fill="#CBD5E1" font-size="17">250 Mbps (Low-Latency Sat)</text>
    <text x="740" y="265" fill="#38BDF8" font-size="19" font-weight="800" class="mono">36 ms</text>
    <text x="1100" y="265" fill="#CBD5E1" font-size="17">99.41%</text>
    <rect x="1460" y="240" width="120" height="35" rx="6" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1" />
    <text x="1520" y="263" fill="#34D399" font-size="14" font-weight="800" text-anchor="middle">UP (Aktif)</text>

    <!-- Row 4: Starlite -->
    <rect x="0" y="300" width="1720" height="65" rx="10" fill="url(#cardGrad)" stroke="#334155" stroke-width="1" />
    <text x="40" y="340" fill="#FFFFFF" font-size="18" font-weight="700">ISP Starlite Dedicated</text>
    <text x="420" y="340" fill="#CBD5E1" font-size="17">500 Mbps (Backbone Utama)</text>
    <text x="740" y="340" fill="#38BDF8" font-size="19" font-weight="800" class="mono">69 ms</text>
    <text x="1100" y="340" fill="#CBD5E1" font-size="17">99.64%</text>
    <rect x="1460" y="315" width="120" height="35" rx="6" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1" />
    <text x="1520" y="338" fill="#34D399" font-size="14" font-weight="800" text-anchor="middle">UP (Aktif)</text>
  </g>

  <!-- 3 Big Metric Highlights -->
  <g transform="translate(100, 660)">
    <rect x="0" y="0" width="540" height="230" rx="18" fill="url(#cardGrad)" stroke="#10B981" stroke-width="1.5" />
    <text x="270" y="80" fill="#10B981" font-size="44" font-weight="800" text-anchor="middle">&lt; 15 Detik</text>
    <text x="270" y="130" fill="#FFFFFF" font-size="20" font-weight="700" text-anchor="middle">Kecepatan Deteksi Down</text>
    <text x="270" y="170" fill="#94A3B8" font-size="15" text-anchor="middle">Turun drastis dari sebelumnya 30–60 menit</text>

    <rect x="590" y="0" width="540" height="230" rx="18" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="1.5" />
    <text x="860" y="80" fill="#38BDF8" font-size="44" font-weight="800" text-anchor="middle">1050 Mbps</text>
    <text x="860" y="130" fill="#FFFFFF" font-size="20" font-weight="700" text-anchor="middle">Total Bandwidth Agregasi</text>
    <text x="860" y="170" fill="#94A3B8" font-size="15" text-anchor="middle">Terpantau secara real-time multi-failover</text>

    <rect x="1180" y="0" width="540" height="230" rx="18" fill="url(#cardGrad)" stroke="#F59E0B" stroke-width="1.5" />
    <text x="1450" y="80" fill="#F59E0B" font-size="44" font-weight="800" text-anchor="middle">28 Perangkat</text>
    <text x="1450" y="130" fill="#FFFFFF" font-size="20" font-weight="700" text-anchor="middle">Sinkronisasi Aset Valid</text>
    <text x="1450" y="170" fill="#94A3B8" font-size="15" text-anchor="middle">Seluruh IP &amp; MAC terhubung live diagnostic</text>
  </g>
`);

// ==========================================
// SLIDE 8: ALUR LIVE DEMO
// ==========================================
const s8 = svgTemplate('Skenario Demo', 8, `
  <text x="100" y="130" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1.5">SKENARIO PENGUJIAN SIDANG</text>
  <text x="100" y="180" fill="#FFFFFF" font-size="44" font-weight="800">5 Langkah Demonstrasi di Depan Dewan Penguji</text>

  <!-- 5 Step Bars -->
  <g transform="translate(100, 240)">
    <!-- Step 1 -->
    <rect x="0" y="0" width="1720" height="110" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <circle cx="65" cy="55" r="30" fill="#10B981" />
    <text x="65" y="65" fill="#0B1120" font-size="24" font-weight="800" text-anchor="middle">1</text>
    <text x="125" y="45" fill="#FFFFFF" font-size="20" font-weight="700">Autentikasi Login Admin</text>
    <text x="125" y="80" fill="#94A3B8" font-size="16">Buka menu Login. Tunjukkan modal autentikasi dengan pilihan tetap login di aplikasi atau keluar dengan aman.</text>

    <!-- Step 2 -->
    <rect x="0" y="135" width="1720" height="110" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <circle cx="65" cy="190" r="30" fill="#38BDF8" />
    <text x="65" y="200" fill="#0B1120" font-size="24" font-weight="800" text-anchor="middle">2</text>
    <text x="125" y="180" fill="#FFFFFF" font-size="20" font-weight="700">NOC Dashboard &amp; Peta Topologi Interaktif</text>
    <text x="125" y="215" fill="#94A3B8" font-size="16">Tampilkan ringkasan status 28 node, grafik bandwidth 4 ISP yang bergerak aktual, dan status gedung kampus.</text>

    <!-- Step 3 -->
    <rect x="0" y="270" width="1720" height="110" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <circle cx="65" cy="325" r="30" fill="#F59E0B" />
    <text x="65" y="335" fill="#0B1120" font-size="24" font-weight="800" text-anchor="middle">3</text>
    <text x="125" y="315" fill="#FFFFFF" font-size="20" font-weight="700">Pengujian CRUD Inventaris &amp; Quick Ping</text>
    <text x="125" y="350" fill="#94A3B8" font-size="16">Demokan tambah/edit perangkat baru (IP, MAC, Lokasi). Klik tombol "Quick Ping" untuk uji latensi instan di depan penguji.</text>

    <!-- Step 4 -->
    <rect x="0" y="405" width="1720" height="110" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <circle cx="65" cy="460" r="30" fill="#A855F7" />
    <text x="65" y="470" fill="#0B1120" font-size="24" font-weight="800" text-anchor="middle">4</text>
    <text x="125" y="450" fill="#FFFFFF" font-size="20" font-weight="700">Manajemen Insiden &amp; Audit Trail</text>
    <text x="125" y="485" fill="#94A3B8" font-size="16">Tunjukkan daftar insiden DOWN, lakukan tombol Acknowledge teknisi, dan perlihatkan pencatatan log audit admin.</text>

    <!-- Step 5 -->
    <rect x="0" y="540" width="1720" height="110" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" />
    <circle cx="65" cy="595" r="30" fill="#10B981" />
    <text x="65" y="605" fill="#0B1120" font-size="24" font-weight="800" text-anchor="middle">5</text>
    <text x="125" y="585" fill="#FFFFFF" font-size="20" font-weight="700">Multiplatform PWA &amp; Unduh Mobile APK</text>
    <text x="125" y="620" fill="#94A3B8" font-size="16">Buka modal "Download App", perlihatkan QR Code untuk smartphone/tablet penguji, dan tunjukkan unduhan APK.</text>
  </g>
`);

// ==========================================
// SLIDE 9: KESIMPULAN & MASA DEPAN
// ==========================================
const s9 = svgTemplate('Kesimpulan & Masa Depan', 9, `
  <text x="100" y="130" fill="#10B981" font-size="16" font-weight="700" letter-spacing="1.5">PENUTUP</text>
  <text x="100" y="180" fill="#FFFFFF" font-size="44" font-weight="800">Kesimpulan &amp; Rencana Masa Depan</text>

  <!-- Left: Kesimpulan -->
  <rect x="100" y="240" width="830" height="660" rx="20" fill="url(#cardGrad)" stroke="#10B981" stroke-width="1.5" />
  <text x="150" y="320" fill="#10B981" font-size="26" font-weight="800">📋 Kesimpulan Penelitian</text>

  <g transform="translate(150, 380)">
    <circle cx="20" cy="20" r="18" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1.5" />
    <text x="20" y="26" fill="#10B981" font-size="16" font-weight="800" text-anchor="middle">1</text>
    <text x="60" y="15" fill="#FFFFFF" font-size="19" font-weight="700">Implementasi Berhasil &amp; Valid</text>
    <text x="60" y="45" fill="#CBD5E1" font-size="16">
      <tspan x="60" dy="0">UNUGHA NetWatch terbukti berhasil memantau 28 node</tspan>
      <tspan x="60" dy="28">perangkat kampus secara real-time dengan akurasi</tspan>
      <tspan x="60" dy="28">latensi dan status operasional yang valid.</tspan>
    </text>

    <circle cx="20" cy="150" r="18" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1.5" />
    <text x="20" y="156" fill="#10B981" font-size="16" font-weight="800" text-anchor="middle">2</text>
    <text x="60" y="145" fill="#FFFFFF" font-size="19" font-weight="700">Integrasi Inventaris Efisien</text>
    <text x="60" y="175" fill="#CBD5E1" font-size="16">
      <tspan x="60" dy="0">Modul CRUD perangkat terhubung langsung dengan uji</tspan>
      <tspan x="60" dy="28">Quick Ping dan Traceroute, mempercepat penanganan</tspan>
      <tspan x="60" dy="28">gangguan jaringan kampus.</tspan>
    </text>

    <circle cx="20" cy="280" r="18" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1.5" />
    <text x="20" y="286" fill="#10B981" font-size="16" font-weight="800" text-anchor="middle">3</text>
    <text x="60" y="275" fill="#FFFFFF" font-size="19" font-weight="700">Standar Kualitas Teruji 100%</text>
    <text x="60" y="305" fill="#CBD5E1" font-size="16">
      <tspan x="60" dy="0">100% lulus Jest test coverage, 0 ESLint warning, 0 type</tspan>
      <tspan x="60" dy="28">errors, serta siap dijalankan di perangkat mobile (APK).</tspan>
    </text>
  </g>

  <!-- Right: Rencana Masa Depan -->
  <rect x="990" y="240" width="830" height="660" rx="20" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="1.5" />
  <text x="1040" y="320" fill="#38BDF8" font-size="26" font-weight="800">🚀 Rencana Pengembangan Masa Depan</text>

  <g transform="translate(1040, 380)">
    <circle cx="20" cy="20" r="18" fill="#38BDF8" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1.5" />
    <text x="20" y="26" fill="#38BDF8" font-size="16" font-weight="800" text-anchor="middle">•</text>
    <text x="60" y="15" fill="#38BDF8" font-size="19" font-weight="700">Integrasi SNMP v3 &amp; NetFlow</text>
    <text x="60" y="45" fill="#CBD5E1" font-size="16">
      <tspan x="60" dy="0">Membaca utilisasi port fisik per-port pada switch Ruijie</tspan>
      <tspan x="60" dy="28">dan suhu prosesor perangkat NOC secara langsung.</tspan>
    </text>

    <circle cx="20" cy="150" r="18" fill="#38BDF8" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1.5" />
    <text x="20" y="156" fill="#38BDF8" font-size="16" font-weight="800" text-anchor="middle">•</text>
    <text x="60" y="145" fill="#38BDF8" font-size="19" font-weight="700">Notifikasi Bot Telegram / WhatsApp Gateway</text>
    <text x="60" y="175" fill="#CBD5E1" font-size="16">
      <tspan x="60" dy="0">Mengirimkan alarm instan darurat ke teknisi seketika</tspan>
      <tspan x="60" dy="28">terjadi pemadaman jalur fiber optik atau failover ISP.</tspan>
    </text>

    <circle cx="20" cy="280" r="18" fill="#38BDF8" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1.5" />
    <text x="20" y="286" fill="#38BDF8" font-size="16" font-weight="800" text-anchor="middle">•</text>
    <text x="60" y="275" fill="#38BDF8" font-size="19" font-weight="700">AI-Driven Predictive Anomaly Detection</text>
    <text x="60" y="305" fill="#CBD5E1" font-size="16">
      <tspan x="60" dy="0">Menerapkan machine learning untuk memprediksi</tspan>
      <tspan x="60" dy="28">kerusakan kabel atau potensi serangan DDoS.</tspan>
    </text>
  </g>
`);

// ==========================================
// SLIDE 10: SESI TANYA JAWAB & PENUTUP
// ==========================================
const s10 = svgTemplate('Tanya Jawab', 10, `
  <g transform="translate(960, 320)">
    <circle cx="0" cy="0" r="50" fill="#10B981" fill-opacity="0.15" stroke="#10B981" stroke-width="2" />
    <text x="0" y="15" fill="#10B981" font-size="44" font-weight="800" text-anchor="middle">💬</text>

    <text x="0" y="100" fill="#10B981" font-size="18" font-weight="800" letter-spacing="2" text-anchor="middle">SESI TANYA JAWAB (Q&amp;A)</text>
    <text x="0" y="175" fill="#FFFFFF" font-size="64" font-weight="800" text-anchor="middle">Terima Kasih</text>
    <text x="0" y="225" fill="#38BDF8" font-size="22" font-weight="600" text-anchor="middle">Dewan Dosen Penguji, Dosen Pembimbing, &amp; Seluruh Hadirin</text>
    <text x="0" y="260" fill="#94A3B8" font-size="18" text-anchor="middle">Terbuka untuk saran, masukan, dan pertanyaan demi penyempurnaan sistem.</text>
  </g>

  <!-- Center Card -->
  <rect x="460" y="680" width="1000" height="190" rx="20" fill="url(#cardGrad)" stroke="#334155" stroke-width="2" />
  <g transform="translate(960, 725)">
    <text x="0" y="0" fill="#10B981" font-size="18" font-weight="700" text-anchor="middle">UNUGHA NetWatch • Universitas Nahdlatul Ulama Al Ghazali Cilacap</text>
    <text x="0" y="40" fill="#FFFFFF" font-size="18" font-weight="600" text-anchor="middle">🌐 Demo Live: <tspan fill="#38BDF8">http://localhost:3000</tspan></text>
    <text x="0" y="75" fill="#94A3B8" font-size="16" text-anchor="middle">📂 GitHub: <tspan fill="#34D399">https://github.com/asngad/unugha-netwatch</tspan></text>
  </g>
`);

const slides = [
  { name: 'slide-01-cover.svg', content: s1 },
  { name: 'slide-02-latar-belakang.svg', content: s2 },
  { name: 'slide-03-rumusan-tujuan.svg', content: s3 },
  { name: 'slide-04-topologi-kampus.svg', content: s4 },
  { name: 'slide-05-fitur-unggulan.svg', content: s5 },
  { name: 'slide-06-kualitas-pengujian.svg', content: s6 },
  { name: 'slide-07-telemetri-performa.svg', content: s7 },
  { name: 'slide-08-alur-demo-penguji.svg', content: s8 },
  { name: 'slide-09-kesimpulan-masa-depan.svg', content: s9 },
  { name: 'slide-10-tanya-jawab-penutup.svg', content: s10 }
];

slides.forEach(slide => {
  const filePath = path.join(slidesDir, slide.name);
  fs.writeFileSync(filePath, slide.content, 'utf8');
  console.log('✅ Generated:', slide.name);
});

// Also create a zip file or bundle if archiver exists or use PowerShell Compress-Archive
console.log('🎉 10 Slide Vector SVG 1920x1080 berhasil digenerate di:', slidesDir);
