const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

async function createPresentation() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Presentasi Sidang: UNUGHA NetWatch';
  pptx.author = 'Asngad - Tim Pengembang IT UNUGHA';
  pptx.company = 'Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap';

  // Palette
  const C_BG = '0B1120';        // Deep Navy NOC
  const C_CARD = '1E293B';      // Slate 800
  const C_BORDER = '334155';    // Slate 700
  const C_EMERALD = '10B981';   // Emerald 500
  const C_SKY = '38BDF8';       // Sky 400
  const C_WHITE = 'F8FAFC';     // Slate 50
  const C_MUTED = '94A3B8';     // Slate 400
  const C_AMBER = 'F59E0B';     // Amber 500

  function addHeader(slide, title, category) {
    // Background fill
    slide.background = { color: C_BG };

    // Category / Breadcrumb
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: C_EMERALD,
      fontFace: 'Arial'
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: C_WHITE,
      fontFace: 'Arial'
    });

    // Decorative line
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8,
      y: 1.45,
      w: 11.7,
      h: 0.02,
      fill: { color: C_BORDER }
    });

    // Footer
    slide.addText('UNUGHA NetWatch • Sistem Monitoring & Inventarisasi Jaringan Kampus', {
      x: 0.8,
      y: 7.1,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      color: C_MUTED,
      fontFace: 'Arial'
    });

    slide.addText('Universitas Nahdlatul Ulama Al Ghazali', {
      x: 9.0,
      y: 7.1,
      w: 3.5,
      h: 0.3,
      fontSize: 9,
      align: 'right',
      color: C_MUTED,
      fontFace: 'Arial'
    });
  }

  // ==========================================
  // SLIDE 1: COVER
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    // Badge
    slide.addText('DEMO SISTEM & UJIAN SIDANG TUGAS AKHIR / SKRIPSI', {
      x: 1.0,
      y: 1.5,
      w: 7.0,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: C_EMERALD,
      fontFace: 'Arial'
    });

    // Big Title
    slide.addText('UNUGHA NetWatch', {
      x: 1.0,
      y: 1.9,
      w: 11.0,
      h: 1.1,
      fontSize: 44,
      bold: true,
      color: C_WHITE,
      fontFace: 'Arial'
    });

    // Subtitle
    slide.addText('Sistem Pemantauan Status Perangkat & Inventaris Jaringan Kampus Terintegrasi', {
      x: 1.0,
      y: 3.0,
      w: 11.0,
      h: 0.6,
      fontSize: 18,
      color: C_SKY,
      fontFace: 'Arial'
    });

    slide.addText('Studi Kasus: Infrastruktur Jaringan NOC Gedung Rektorat & Kampus UNUGHA Cilacap', {
      x: 1.0,
      y: 3.6,
      w: 11.0,
      h: 0.4,
      fontSize: 14,
      color: C_MUTED,
      fontFace: 'Arial'
    });

    // Info Card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0,
      y: 4.5,
      w: 11.3,
      h: 2.0,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText([
      { text: 'Pengembang / Penyaji : ', options: { bold: true, color: C_EMERALD } },
      { text: 'Asngad (Tim IT & Jaringan Kampus UNUGHA)\n', options: { color: C_WHITE } },
      { text: 'Institusi                 : ', options: { bold: true, color: C_EMERALD } },
      { text: 'Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap\n', options: { color: C_WHITE } },
      { text: 'Teknologi Utama        : ', options: { bold: true, color: C_EMERALD } },
      { text: 'Node.js, Express, WebSocket Socket.io, ICMP/TCP Ping Engine, PWA & Android APK\n', options: { color: C_WHITE } },
      { text: 'Repository GitHub     : ', options: { bold: true, color: C_EMERALD } },
      { text: 'https://github.com/asngad/unugha-netwatch', options: { color: C_SKY } }
    ], {
      x: 1.3,
      y: 4.7,
      w: 10.7,
      h: 1.6,
      fontSize: 12,
      fontFace: 'Arial',
      lineSpacing: 22
    });
  }

  // ==========================================
  // SLIDE 2: LATAR BELAKANG & PERMASALAHAN
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Latar Belakang & Urgensi Permasalahan Jaringan', 'Pendahuluan');

    // Box 1
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.8, w: 3.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('🌐 Kompleksitas 4 ISP Multi-WAN', {
      x: 1.0, y: 2.0, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText('UNUGHA mengoperasikan 4 ISP sekaligus (Citra 100M, Indibiz 200M, Starlink 250M, Starlite 500M = Total 1050 Mbps).\n\nTanpa sistem monitoring, tim NOC kesulitan mendeteksi ISP mana yang mengalami packet loss atau putus jalur failover.', {
      x: 1.0, y: 2.5, w: 3.2, h: 4.0,
      fontSize: 11.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 18
    });

    // Box 2
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.8, y: 1.8, w: 3.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('⚡ Deteksi Insiden Masih Reaktif', {
      x: 5.0, y: 2.0, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_AMBER, fontFace: 'Arial'
    });
    slide.addText('Insiden access point atau switch mati di gedung perkuliahan (GH1, GH2, FMIKOM, Perpustakaan) baru diketahui setelah ada komplain dari dosen atau mahasiswa.\n\nMembutuhkan rata-rata 30-60 menit hanya untuk mendiagnosa titik kerusakan.', {
      x: 5.0, y: 2.5, w: 3.2, h: 4.0,
      fontSize: 11.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 18
    });

    // Box 3
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8, y: 1.8, w: 3.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('📋 Inventarisasi Tercecer & Manual', {
      x: 9.0, y: 2.0, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText('Data teknis 28+ perangkat (Ruijie Core Gateway, Switch PoE, Access Point Wi-Fi 6, IP Address, MAC Address) sebelumnya tersebar di spreadsheet manual.\n\nTidak ada sinkronisasi antara data inventaris fisik dengan status operasional hidup/matinya perangkat.', {
      x: 9.0, y: 2.5, w: 3.2, h: 4.0,
      fontSize: 11.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 18
    });
  }

  // ==========================================
  // SLIDE 3: RUMUSAN MASALAH & TUJUAN
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Rumusan Masalah & Tujuan Pengembangan', 'Tinjauan Strategis');

    // Kolom Kiri: Rumusan Masalah
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.8, w: 5.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('🎯 Rumusan Masalah', {
      x: 1.1, y: 2.1, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText([
      { text: '1. ', options: { bold: true, color: C_SKY } },
      { text: 'Bagaimana merancang sistem monitoring real-time yang dapat mendeteksi kondisi UP/DOWN seluruh perangkat jaringan kampus dalam hitungan detik?\n\n', options: { color: C_WHITE } },
      { text: '2. ', options: { bold: true, color: C_SKY } },
      { text: 'Bagaimana membangun modul inventaris perangkat yang terintegrasi langsung dengan fitur diagnostik cepat (Quick Ping & Traceroute)?\n\n', options: { color: C_WHITE } },
      { text: '3. ', options: { bold: true, color: C_SKY } },
      { text: 'Bagaimana menyajikan visualisasi telemetri bandwidth 4 ISP dan menyediakan aksesibilitas multi-platform (Desktop NOC, Tablet, dan Mobile APK)?', options: { color: C_WHITE } }
    ], {
      x: 1.1, y: 2.7, w: 5.0, h: 3.8,
      fontSize: 12, fontFace: 'Arial', lineSpacing: 20
    });

    // Kolom Kanan: Tujuan
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.8, w: 5.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('🏆 Tujuan Sistem UNUGHA NetWatch', {
      x: 7.1, y: 2.1, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText([
      { text: '✓ Visibilitas NOC Terpusat: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Memantau 28 node perangkat kampus UNUGHA secara otomatis setiap siklus 15 detik.\n\n', options: { color: C_WHITE } },
      { text: '✓ Manajemen Insiden & SLA: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Mencatat riwayat downtime, insiden kegagalan, dan audit trail operasional secara akurat.\n\n', options: { color: C_WHITE } },
      { text: '✓ CRUD Inventaris Lengkap: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Pengelolaan data perangkat dinamis dengan validasi IP, MAC, dan penempatan lokasi gedung.\n\n', options: { color: C_WHITE } },
      { text: '✓ Aksesibilitas Fleksibel: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Dapat diakses oleh staf NOC melalui browser, PWA, maupun diunduh langsung sebagai APK Android.', options: { color: C_WHITE } }
    ], {
      x: 7.1, y: 2.7, w: 5.0, h: 3.8,
      fontSize: 12, fontFace: 'Arial', lineSpacing: 20
    });
  }

  // ==========================================
  // SLIDE 4: TOPOLOGI KAMPUS & ARSITEKTUR
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Arsitektur Sistem & Topologi Jaringan Kampus', 'Infrastruktur');

    // 4 ISP Cards
    const isps = [
      { name: 'ISP Citra', cap: '100 Mbps', role: 'Fiber Optic Dedicated' },
      { name: 'ISP Indibiz', cap: '200 Mbps', role: 'Telkom Fiber Backup' },
      { name: 'ISP Starlink', cap: '250 Mbps', role: 'Satelit LEO Low-Latency' },
      { name: 'ISP Starlite', cap: '500 Mbps', role: 'Backbone Utama Rektorat' }
    ];

    isps.forEach((isp, idx) => {
      const xPos = 0.8 + idx * 2.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: 1.8, w: 2.8, h: 1.3,
        fill: { color: C_CARD },
        line: { color: C_EMERALD, width: 1 },
        rectRadius: 0.1
      });
      slide.addText(isp.name, {
        x: xPos + 0.15, y: 1.95, w: 2.5, h: 0.3,
        fontSize: 12, bold: true, color: C_WHITE, fontFace: 'Arial'
      });
      slide.addText(`${isp.cap} • ${isp.role}`, {
        x: xPos + 0.15, y: 2.3, w: 2.5, h: 0.6,
        fontSize: 10, color: C_MUTED, fontFace: 'Arial'
      });
    });

    // Core & Distribution
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 3.35, w: 11.6, h: 1.5,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('CORE GATEWAY & DISTRIBUTION SWITCH LAYER (NOC RACK SERVER REKTORAT)', {
      x: 1.1, y: 3.5, w: 11.0, h: 0.35,
      fontSize: 12, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText('• Ruijie Reyee RG-EG1510XS Multi-WAN Gateway (192.168.1.1) - Load Balancing & Policy Routing 4 ISP\n• Ruijie RG-NBS3100-24GT4SFP 24-Port Managed Switch (192.168.1.2) - Distribusi Fiber & VLAN Kampus\n• UNUGHA NetWatch Monitoring Server - Node.js Backend Engine & Socket.io Provider (Port 3000)', {
      x: 1.1, y: 3.9, w: 11.0, h: 0.85,
      fontSize: 11, color: C_WHITE, fontFace: 'Arial', lineSpacing: 18
    });

    // Access Layer & Locations
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 5.1, w: 11.6, h: 1.6,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('DISTRIBUSI TITIK AKSES & BLOK GEDUNG KAMPUS UNUGHA', {
      x: 1.1, y: 5.25, w: 11.0, h: 0.3,
      fontSize: 12, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText('• Gedung Rektorat : NOC Server, Ruang Rektor, LPM, BAAK, Keuangan (Ruijie Reyee RG-RAP2260(E))\n• Gedung Hijau 1  : Lantai 1, Lantai 2 Sayap B, Lantai 3 Aula Utama\n• Gedung Hijau 2  : Lantai 1, Lantai 2, Lantai 3 Ruang Kuliah\n• FMIKOM & Perpus : Laboratorium Komputer, Ruang Dosen, Perpustakaan Lantai Atas & Bawah', {
      x: 1.1, y: 5.6, w: 11.0, h: 0.95,
      fontSize: 10.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 17
    });
  }

  // ==========================================
  // SLIDE 5: FITUR UTAMA SISTEM
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Fitur Utama & Keunggulan Fungsional Sistem', 'Fitur Sistem');

    const features = [
      {
        icon: '📡',
        title: 'Real-time Ping Engine',
        desc: 'Siklus ping ICMP/TCP otomatis setiap 15 detik ke seluruh 28 IP perangkat kampus. Menghitung latency aktual (ms), uptime persentase, dan packet loss secara presisi.'
      },
      {
        icon: '📦',
        title: 'CRUD Inventaris Lengkap',
        desc: 'Manajemen data perangkat (Create, Read, Update, Delete) dengan form validasi IP, MAC, Vendor, Tipe, dan Lokasi Gedung. Dilengkapi tombol Quick Ping & Traceroute visual.'
      },
      {
        icon: '🚨',
        title: 'Manajemen Insiden & Alert',
        desc: 'Otomatis membuat tiket insiden saat perangkat berstatus DOWN. Dilengkapi fitur Acknowledge, pencatatan waktu resolusi, dan riwayat audit aktivitas admin.'
      },
      {
        icon: '📱',
        title: 'Multi-Platform PWA & APK',
        desc: 'Dapat diakses di semua ukuran layar (PC, Mac, Tablet, Android). Menyediakan download APK Android mandiri dan modal instalasi interaktif dengan QR Code.'
      }
    ];

    features.forEach((feat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.8 + col * 5.9;
      const y = 1.8 + row * 2.5;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w: 5.7, h: 2.3,
        fill: { color: C_CARD },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.1
      });

      slide.addText(`${feat.icon}  ${feat.title}`, {
        x: x + 0.3, y: y + 0.25, w: 5.1, h: 0.4,
        fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial'
      });

      slide.addText(feat.desc, {
        x: x + 0.3, y: y + 0.75, w: 5.1, h: 1.4,
        fontSize: 11.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 18
      });
    });
  }

  // ==========================================
  // SLIDE 6: KUALITAS KODE & PENGUJIAN (TEST SUITE)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Jaminan Kualitas Perangkat Lunak & Metodologi Pengujian', 'Quality Assurance');

    // Box 1: Unit Test Coverage
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.8, w: 3.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🧪 Unit Testing (Jest)', {
      x: 1.0, y: 2.0, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• 10 Test Suites Lolos 100%\n', options: { bold: true, color: C_WHITE } },
      { text: '• 38 Unit Tests Terverifikasi\n\n', options: { color: C_WHITE } },
      { text: 'Cakupan Pengujian:\n', options: { bold: true, color: C_SKY } },
      { text: '1. Auth Controller & Session\n2. Device CRUD & Validation\n3. Incident Management SLA\n4. Bandwidth Aggregation Service\n5. Hardware Telemetry Service\n6. Ping Engine & Packet Loss\n7. Socket.io Event Broadcaster\n8. Audit Logger Engine', options: { color: C_MUTED } }
    ], {
      x: 1.0, y: 2.5, w: 3.2, h: 4.0,
      fontSize: 11, fontFace: 'Arial', lineSpacing: 17
    });

    // Box 2: Linter & Static Analysis
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.8, y: 1.8, w: 3.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🔍 ESLint v10 Flat Config', {
      x: 5.0, y: 2.0, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• 0 Errors, 0 Warnings\n', options: { bold: true, color: C_WHITE } },
      { text: '• Clean Code Standard\n\n', options: { color: C_WHITE } },
      { text: 'Pemeriksaan Otomatis:\n', options: { bold: true, color: C_EMERALD } },
      { text: '- Pencegahan memory leak pada event listener WebSocket\n- Validasi penanganan error async/await\n- Standar penamaan camelCase konsisten\n- Pembersihan unused variables', options: { color: C_MUTED } }
    ], {
      x: 5.0, y: 2.5, w: 3.2, h: 4.0,
      fontSize: 11, fontFace: 'Arial', lineSpacing: 17
    });

    // Box 3: TypeScript Compiler
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8, y: 1.8, w: 3.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_AMBER, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🛡️ TypeScript Typecheck', {
      x: 9.0, y: 2.0, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_AMBER, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• 0 Type Errors (TSC)\n', options: { bold: true, color: C_WHITE } },
      { text: '• Tipe Data Ketat (JSDoc)\n\n', options: { color: C_WHITE } },
      { text: 'Keamanan Data:\n', options: { bold: true, color: C_SKY } },
      { text: '- Skema validasi objek perangkat (Device Model)\n- Integritas data format JSON\n- Pencegahan null pointer exception pada status latency & uptime', options: { color: C_MUTED } }
    ], {
      x: 9.0, y: 2.5, w: 3.2, h: 4.0,
      fontSize: 11, fontFace: 'Arial', lineSpacing: 17
    });
  }

  // ==========================================
  // SLIDE 7: HASIL EVALUASI & ANALISIS PERFORMA
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Hasil Pengujian & Analisis Telemetri Jaringan UNUGHA', 'Hasil & Evaluasi');

    // Table ISP Telemetry
    const tableData = [
      [
        { text: 'Nama ISP', options: { bold: true, color: C_WHITE, fill: { color: '334155' } } },
        { text: 'Kapasitas', options: { bold: true, color: C_WHITE, fill: { color: '334155' } } },
        { text: 'Rata-rata Latency', options: { bold: true, color: C_WHITE, fill: { color: '334155' } } },
        { text: 'Uptime SLA', options: { bold: true, color: C_WHITE, fill: { color: '334155' } } },
        { text: 'Status Jalur', options: { bold: true, color: C_WHITE, fill: { color: '334155' } } }
      ],
      [
        { text: 'ISP Citra', options: { color: C_WHITE } },
        { text: '100 Mbps', options: { color: C_WHITE } },
        { text: '1 ms (Sangat Rendah)', options: { color: C_EMERALD, bold: true } },
        { text: '99.75%', options: { color: C_WHITE } },
        { text: 'UP (Aktif)', options: { color: C_EMERALD, bold: true } }
      ],
      [
        { text: 'ISP Telkom Indibiz', options: { color: C_WHITE } },
        { text: '200 Mbps', options: { color: C_WHITE } },
        { text: '1 ms (Sangat Rendah)', options: { color: C_EMERALD, bold: true } },
        { text: '99.85%', options: { color: C_WHITE } },
        { text: 'UP (Aktif)', options: { color: C_EMERALD, bold: true } }
      ],
      [
        { text: 'ISP Starlink (LEO)', options: { color: C_WHITE } },
        { text: '250 Mbps', options: { color: C_WHITE } },
        { text: '36 ms (Stabil)', options: { color: C_SKY, bold: true } },
        { text: '99.41%', options: { color: C_WHITE } },
        { text: 'UP (Aktif)', options: { color: C_EMERALD, bold: true } }
      ],
      [
        { text: 'ISP Starlite Dedicated', options: { color: C_WHITE } },
        { text: '500 Mbps', options: { color: C_WHITE } },
        { text: '69 ms (Normal FO)', options: { color: C_SKY, bold: true } },
        { text: '99.64%', options: { color: C_WHITE } },
        { text: 'UP (Aktif)', options: { color: C_EMERALD, bold: true } }
      ]
    ];

    slide.addTable(tableData, {
      x: 0.8, y: 1.8, w: 11.6, h: 2.2,
      border: { color: C_BORDER, pt: 1 },
      fill: { color: C_CARD },
      fontSize: 11,
      fontFace: 'Arial',
      align: 'center'
    });

    // Summary Highlight Cards
    const highlights = [
      { num: '< 15 Detik', label: 'Waktu Deteksi Insiden (Down)', sub: 'Sebelumnya butuh 30-60 menit laporan manual' },
      { num: '1050 Mbps', label: 'Total Kapasitas Terpantau', sub: 'Multi-WAN Aggregation 4 ISP terintegrasi' },
      { num: '100%', label: 'Akurasi Sinkronisasi Inventaris', sub: 'Seluruh IP & MAC tercatat dan terhubung live ping' }
    ];

    highlights.forEach((hl, i) => {
      const x = 0.8 + i * 3.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 4.3, w: 3.7, h: 2.4,
        fill: { color: C_CARD },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.1
      });

      slide.addText(hl.num, {
        x: x + 0.2, y: 4.5, w: 3.3, h: 0.7,
        fontSize: 26, bold: true, color: C_EMERALD, fontFace: 'Arial', align: 'center'
      });

      slide.addText(hl.label, {
        x: x + 0.2, y: 5.2, w: 3.3, h: 0.5,
        fontSize: 12, bold: true, color: C_WHITE, fontFace: 'Arial', align: 'center'
      });

      slide.addText(hl.sub, {
        x: x + 0.2, y: 5.8, w: 3.3, h: 0.7,
        fontSize: 10, color: C_MUTED, fontFace: 'Arial', align: 'center'
      });
    });
  }

  // ==========================================
  // SLIDE 8: PANDUAN LIVE DEMO DI DEPAN PENGUJI
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Alur & Skenario Live Demo di Depan Dewan Penguji', 'Skenario Demo');

    const steps = [
      {
        no: '1',
        title: 'Login & Autentikasi Admin',
        desc: 'Tunjukkan form login admin. Demonstrasikan popup modal konfirmasi autentikasi ("Tetap di Aplikasi" vs "Keluar").'
      },
      {
        no: '2',
        title: 'NOC Dashboard & Topologi Map',
        desc: 'Tampilkan status agregat 4 ISP, grafik utilisasi bandwidth, dan peta interaktif kampus UNUGHA Cilacap.'
      },
      {
        no: '3',
        title: 'Inventaris & CRUD Perangkat',
        desc: 'Demokan tambah/edit perangkat baru (IP, MAC, Lokasi Gedung). Jalankan fitur Quick Ping & Traceroute live.'
      },
      {
        no: '4',
        title: 'Manajemen Insiden & Log Audit',
        desc: 'Tunjukkan saat ada node DOWN, muncul alarm visual. Lakukan tombol Acknowledge dan periksa riwayat audit log.'
      },
      {
        no: '5',
        title: 'Demo Mobile PWA & Download APK',
        desc: 'Buka modal "Download App", tunjukkan QR Code interaktif untuk scan smartphone/tablet, dan unduh file APK langsung.'
      }
    ];

    steps.forEach((st, i) => {
      const y = 1.8 + i * 1.0;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y, w: 11.6, h: 0.88,
        fill: { color: C_CARD },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.08
      });

      // Number badge
      slide.addShape(pptx.shapes.OVAL, {
        x: 1.0, y: y + 0.15, w: 0.55, h: 0.55,
        fill: { color: C_EMERALD }
      });
      slide.addText(st.no, {
        x: 1.0, y: y + 0.15, w: 0.55, h: 0.55,
        fontSize: 14, bold: true, color: C_BG, fontFace: 'Arial', align: 'center'
      });

      // Title & Desc
      slide.addText(st.title, {
        x: 1.7, y: y + 0.12, w: 3.5, h: 0.35,
        fontSize: 12, bold: true, color: C_WHITE, fontFace: 'Arial'
      });
      slide.addText(st.desc, {
        x: 5.2, y: y + 0.12, w: 7.0, h: 0.65,
        fontSize: 10.5, color: C_MUTED, fontFace: 'Arial', lineSpacing: 15
      });
    });
  }

  // ==========================================
  // SLIDE 9: KESIMPULAN & PENGEMBANGAN LANJUTAN
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Kesimpulan & Rencana Pengembangan Masa Depan', 'Penutup');

    // Kolom Kiri: Kesimpulan
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.8, w: 5.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('📋 Kesimpulan Penelitian', {
      x: 1.1, y: 2.1, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText([
      { text: '1. Sistem Berhasil Diimplementasikan: ', options: { bold: true, color: C_WHITE } },
      { text: 'UNUGHA NetWatch mampu memantau 28 perangkat jaringan kampus dengan data valid & aktual secara real-time via WebSocket.\n\n', options: { color: C_MUTED } },
      { text: '2. Modul Inventaris & CRUD Optimal: ', options: { bold: true, color: C_WHITE } },
      { text: 'Pengelolaan data aset jaringan berfungsi sempurna dengan fitur diagnostik Quick Ping instan.\n\n', options: { color: C_MUTED } },
      { text: '3. Kualitas Kode Teruji 100%: ', options: { bold: true, color: C_WHITE } },
      { text: 'Lolos uji Jest coverage 100%, ESLint 0 warning, dan TypeScript compile check 0 error, serta didukung installer mobile APK.', options: { color: C_MUTED } }
    ], {
      x: 1.1, y: 2.7, w: 5.0, h: 3.8,
      fontSize: 11.5, fontFace: 'Arial', lineSpacing: 19
    });

    // Kolom Kanan: Rencana Masa Depan
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.8, w: 5.6, h: 4.9,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('🚀 Rencana Pengembangan Lanjutan', {
      x: 7.1, y: 2.1, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• Integrasi Protokol SNMP v3 / NetFlow:\n', options: { bold: true, color: C_WHITE } },
      { text: 'Membaca utilisasi bandwidth per-port pada switch Ruijie dan suhu prosesor perangkat secara real.\n\n', options: { color: C_MUTED } },
      { text: '• Notifikasi Otomatis Bot Telegram / WhatsApp:\n', options: { bold: true, color: C_WHITE } },
      { text: 'Mengirimkan pesan instan darurat ke teknisi saat terjadi pemadaman jalur backbone atau ISP.\n\n', options: { color: C_MUTED } },
      { text: '• AI-Driven Anomaly Detection:\n', options: { bold: true, color: C_WHITE } },
      { text: 'Menerapkan machine learning untuk memprediksi degradasi performa sebelum terjadi downtime total.', options: { color: C_MUTED } }
    ], {
      x: 7.1, y: 2.7, w: 5.0, h: 3.8,
      fontSize: 11.5, fontFace: 'Arial', lineSpacing: 19
    });
  }

  // ==========================================
  // SLIDE 10: SESI TANYA JAWAB & PENUTUP
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addText('SESI TANYA JAWAB (Q&A)', {
      x: 1.0, y: 1.8, w: 11.0, h: 0.4,
      fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial', align: 'center'
    });

    slide.addText('Terima Kasih', {
      x: 1.0, y: 2.3, w: 11.0, h: 1.2,
      fontSize: 50, bold: true, color: C_WHITE, fontFace: 'Arial', align: 'center'
    });

    slide.addText('Dewan Dosen Penguji, Dosen Pembimbing, & Seluruh Hadirin', {
      x: 1.0, y: 3.5, w: 11.0, h: 0.5,
      fontSize: 16, color: C_SKY, fontFace: 'Arial', align: 'center'
    });

    // Contact card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.0, y: 4.4, w: 7.3, h: 2.0,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText([
      { text: 'UNUGHA NetWatch - Campus Network Management System\n\n', options: { bold: true, color: C_EMERALD } },
      { text: '🌐 Demo Live: http://localhost:3000\n', options: { color: C_WHITE } },
      { text: '📂 Repository GitHub: https://github.com/asngad/unugha-netwatch\n', options: { color: C_SKY } },
      { text: '🏢 Universitas Nahdlatul Ulama Al Ghazali Cilacap', options: { color: C_MUTED } }
    ], {
      x: 3.3, y: 4.6, w: 6.7, h: 1.6,
      fontSize: 12, fontFace: 'Arial', align: 'center', lineSpacing: 20
    });
  }

  // Ensure output dir exists
  const outDir = path.join(__dirname, 'public', 'downloads');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'UNUGHA-NetWatch-Presentasi-Sidang.pptx');
  await pptx.writeFile({ fileName: outPath });
  console.log('✅ File presentasi PowerPoint berhasil dibuat di:', outPath);

  // Copy to C:\monitoring_unugha as well
  const mirrorDir = path.join('C:', 'monitoring_unugha', 'public', 'downloads');
  if (fs.existsSync(mirrorDir)) {
    fs.copyFileSync(outPath, path.join(mirrorDir, 'UNUGHA-NetWatch-Presentasi-Sidang.pptx'));
    console.log('✅ File presentasi juga disalin ke C:\\monitoring_unugha');
  }
}

createPresentation().catch(err => {
  console.error('Error creating presentation:', err);
  process.exit(1);
});
