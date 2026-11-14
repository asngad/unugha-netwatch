const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

async function createPresentation() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Presentasi Sidang: UNUGHA NetWatch (Lengkap dengan Diagram UML, Use Case, Sequence, & Arsitektur)';
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
  const C_PURPLE = 'A855F7';    // Purple 500
  const C_ROSE = 'F43F5E';      // Rose 500

  function addHeader(slide, title, category, slideNum) {
    slide.background = { color: C_BG };

    // Category / Breadcrumb
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.45,
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
      y: 0.75,
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
      y: 1.4,
      w: 11.7,
      h: 0.02,
      fill: { color: C_BORDER }
    });

    // Footer
    slide.addText('UNUGHA NetWatch • Sistem Monitoring & Inventarisasi Jaringan Kampus', {
      x: 0.8,
      y: 7.15,
      w: 8.0,
      h: 0.25,
      fontSize: 9,
      color: C_MUTED,
      fontFace: 'Arial'
    });

    slide.addText(`Slide ${slideNum} / 15`, {
      x: 9.0,
      y: 7.15,
      w: 3.5,
      h: 0.25,
      fontSize: 9,
      bold: true,
      align: 'right',
      color: C_EMERALD,
      fontFace: 'Arial'
    });
  }

  // ==========================================
  // SLIDE 1: COVER
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addText('DEMO SISTEM & UJIAN SIDANG TUGAS AKHIR / SKRIPSI', {
      x: 1.0, y: 1.3, w: 8.0, h: 0.35,
      fontSize: 11, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });

    slide.addText('UNUGHA NetWatch', {
      x: 1.0, y: 1.7, w: 11.0, h: 1.1,
      fontSize: 44, bold: true, color: C_WHITE, fontFace: 'Arial'
    });

    slide.addText('Sistem Pemantauan Status Perangkat & Inventaris Jaringan Kampus Terintegrasi', {
      x: 1.0, y: 2.8, w: 11.0, h: 0.6,
      fontSize: 18, bold: true, color: C_SKY, fontFace: 'Arial'
    });

    slide.addText('Studi Kasus: Infrastruktur Jaringan NOC Gedung Rektorat & Kampus UNUGHA Cilacap', {
      x: 1.0, y: 3.4, w: 11.0, h: 0.4,
      fontSize: 14, color: C_MUTED, fontFace: 'Arial'
    });

    // Info Card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0, y: 4.2, w: 11.3, h: 2.5,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide.addText([
      { text: 'Penyaji / Pengembang : ', options: { bold: true, color: C_EMERALD } },
      { text: 'Asngad (Tim IT & Administrator Jaringan Kampus UNUGHA)\n', options: { color: C_WHITE } },
      { text: 'Institusi                 : ', options: { bold: true, color: C_EMERALD } },
      { text: 'Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap - FMIKOM\n', options: { color: C_WHITE } },
      { text: 'Diagram Teknis Lengkap : ', options: { bold: true, color: C_EMERALD } },
      { text: 'Use Case Diagram • Antigravity Architecture • Sequence Diagram • UML Class Model\n', options: { color: C_SKY } },
      { text: 'Teknologi Utama        : ', options: { bold: true, color: C_EMERALD } },
      { text: 'Node.js Express, Socket.io WebSocket, ICMP/TCP Ping Engine, PWA, & Android APK\n', options: { color: C_WHITE } },
      { text: 'Repository GitHub     : ', options: { bold: true, color: C_EMERALD } },
      { text: 'https://github.com/asngad/unugha-netwatch', options: { color: C_SKY } }
    ], {
      x: 1.3, y: 4.4, w: 10.7, h: 2.1,
      fontSize: 11.5, fontFace: 'Arial', lineSpacing: 21
    });
  }

  // ==========================================
  // SLIDE 2: LATAR BELAKANG & MASALAH
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Latar Belakang & Urgensi Permasalahan Jaringan', 'Pendahuluan', 2);

    const problems = [
      {
        title: '🌐 4 ISP Multi-WAN Kompleks',
        badge: 'Total 1050 Mbps',
        color: C_SKY,
        text: 'UNUGHA melanggan 4 ISP simultan: Citra (100M FO), Indibiz (200M FO), Starlink (250M Satelit LEO), dan Starlite (500M Dedicated Utama).\n\nTanpa sistem monitoring terpusat, tim NOC kesulitan mendeteksi ISP mana yang mengalami packet loss atau putus jalur failover.'
      },
      {
        title: '⚠️ Deteksi Insiden Reaktif',
        badge: 'Terlambat 30-60 Menit',
        color: C_AMBER,
        text: 'Insiden access point atau switch mati di ruang kuliah (GH1, GH2, Aula, FMIKOM, Perpustakaan) baru diketahui setelah ada komplain civitas akademika.\n\nMembutuhkan waktu lama untuk diagnosa dan mengganggu kelancaran SIAKAD serta CBT kampus.'
      },
      {
        title: '📋 Inventarisasi Tercecer & Manual',
        badge: 'Data Statis Spreadsheet',
        color: C_EMERALD,
        text: 'Pencatatan 28+ perangkat jaringan (Ruijie Core Gateway, Switch PoE, AP Wi-Fi 6) tersimpan di file terpisah tanpa hubungan dengan status fisik perangkat.\n\nTidak ada alat uji cepat (Quick Ping & Traceroute visual) terintegrasi pada data inventaris.'
      }
    ];

    problems.forEach((p, i) => {
      const x = 0.8 + i * 4.0;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 1.7, w: 3.7, h: 5.1,
        fill: { color: C_CARD },
        line: { color: p.color, width: 1.5 },
        rectRadius: 0.1
      });

      slide.addText(p.title, {
        x: x + 0.2, y: 1.9, w: 3.3, h: 0.4,
        fontSize: 13.5, bold: true, color: p.color, fontFace: 'Arial'
      });
      slide.addText(p.badge, {
        x: x + 0.2, y: 2.3, w: 3.3, h: 0.3,
        fontSize: 10, bold: true, color: C_MUTED, fontFace: 'Arial'
      });
      slide.addText(p.text, {
        x: x + 0.2, y: 2.7, w: 3.3, h: 3.9,
        fontSize: 11, color: C_WHITE, fontFace: 'Arial', lineSpacing: 18
      });
    });
  }

  // ==========================================
  // SLIDE 3: RUMUSAN MASALAH & TUJUAN
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Rumusan Masalah & Tujuan Pengembangan', 'Tinjauan Ilmiah', 3);

    // Rumusan Masalah
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 5.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🎯 Rumusan Masalah', {
      x: 1.1, y: 1.95, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText([
      { text: '1. ', options: { bold: true, color: C_SKY } },
      { text: 'Bagaimana membangun sistem pemantauan real-time berbasis ICMP/TCP ping otomatis dengan deteksi kegagalan < 15 detik?\n\n', options: { color: C_WHITE } },
      { text: '2. ', options: { bold: true, color: C_SKY } },
      { text: 'Bagaimana mengintegrasikan manajemen inventaris perangkat dengan diagnostik langsung (Quick Ping & Traceroute)?\n\n', options: { color: C_WHITE } },
      { text: '3. ', options: { bold: true, color: C_SKY } },
      { text: 'Bagaimana menyajikan visualisasi telemetri 4 ISP dan menyediakan aksesibilitas multi-platform (Web, PWA, dan Android APK)?', options: { color: C_WHITE } }
    ], {
      x: 1.1, y: 2.5, w: 5.0, h: 4.1,
      fontSize: 11.5, fontFace: 'Arial', lineSpacing: 20
    });

    // Tujuan
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.7, w: 5.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🏆 Tujuan Sistem UNUGHA NetWatch', {
      x: 7.1, y: 1.95, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText([
      { text: '✓ Visibilitas NOC Terpusat: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Memantau 28 node perangkat kampus secara simultan via WebSocket real-time.\n\n', options: { color: C_WHITE } },
      { text: '✓ Manajemen Insiden Akurat: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Pencatatan tiket gangguan DOWN, aksi acknowledge teknisi, & SLA report bulanan.\n\n', options: { color: C_WHITE } },
      { text: '✓ CRUD Inventaris Valid: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Pengelolaan data aset dengan validasi IP, MAC, Vendor, & Lokasi Gedung.\n\n', options: { color: C_WHITE } },
      { text: '✓ Portabilitas Multiplatform: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Aplikasi siap dipasang di laptop, tablet, dan smartphone Android (APK mandiri).', options: { color: C_WHITE } }
    ], {
      x: 7.1, y: 2.5, w: 5.0, h: 4.1,
      fontSize: 11.5, fontFace: 'Arial', lineSpacing: 20
    });
  }

  // ==========================================
  // SLIDE 4: DIAGRAM USE CASE (BARU)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Diagram Use Case Sistem (Use Case Diagram)', 'Pemodelan Sistem', 4);

    // Actor 1: Admin NOC
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 2.7, h: 2.4,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 2 },
      rectRadius: 0.1
    });
    slide.addText('👤 AKTOR 1:\nADMIN NOC UTAMA', {
      x: 0.9, y: 1.85, w: 2.5, h: 0.5,
      fontSize: 12, bold: true, color: C_EMERALD, fontFace: 'Arial', align: 'center'
    });
    slide.addText('• Login & Autentikasi Sesi\n• CRUD Inventaris Perangkat\n• Kelola Pengaturan & Ambang Batas\n• Ekspor Laporan SLA (CSV)\n• Manajemen Insiden & Log Audit', {
      x: 0.9, y: 2.4, w: 2.5, h: 1.6,
      fontSize: 9.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 14
    });

    // Actor 2: Teknisi Lapangan
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 4.3, w: 2.7, h: 2.5,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 2 },
      rectRadius: 0.1
    });
    slide.addText('👷 AKTOR 2:\nTEKNISI LAPANGAN', {
      x: 0.9, y: 4.45, w: 2.5, h: 0.5,
      fontSize: 12, bold: true, color: C_SKY, fontFace: 'Arial', align: 'center'
    });
    slide.addText('• Pantau Peta Kampus & Topologi\n• Jalankan Quick Ping & Traceroute\n• Terima Alarm Notifikasi DOWN\n• Tangani & Acknowledge Insiden\n• Unduh Mobile App (PWA & APK)', {
      x: 0.9, y: 5.0, w: 2.5, h: 1.6,
      fontSize: 9.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 14
    });

    // Center Use Cases Boundary Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.8, y: 1.7, w: 5.6, h: 5.1,
      fill: { color: '0F172A' },
      line: { color: C_BORDER, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('BATAS SISTEM (SYSTEM BOUNDARY: UNUGHA NETWATCH)', {
      x: 3.9, y: 1.8, w: 5.4, h: 0.3,
      fontSize: 10, bold: true, color: C_MUTED, fontFace: 'Arial', align: 'center'
    });

    const useCases = [
      { name: 'UC-01: Autentikasi Admin (Login & Konfirmasi Keluar)', col: C_EMERALD, y: 2.2 },
      { name: 'UC-02: Pemantauan Dashboard NOC & Peta Interaktif', col: C_SKY, y: 2.8 },
      { name: 'UC-03: Manajemen Inventaris Aset (CRUD Perangkat)', col: C_EMERALD, y: 3.4 },
      { name: 'UC-04: Diagnostik Cepat (Quick Ping & Traceroute Visual)', col: C_SKY, y: 4.0 },
      { name: 'UC-05: Manajemen Tiket Insiden & Tindakan Acknowledge', col: C_AMBER, y: 4.6 },
      { name: 'UC-06: Telemetri Bandwidth 4 ISP & Hardware NOC', col: C_SKY, y: 5.2 },
      { name: 'UC-07: Ekspor Laporan SLA & Log Audit Aktivitas', col: C_EMERALD, y: 5.8 },
      { name: 'UC-08: Instalasi Multi-Platform (PWA & Unduh APK)', col: C_PURPLE, y: 6.4 }
    ];

    useCases.forEach(uc => {
      slide.addShape(pptx.shapes.OVAL, {
        x: 4.1, y: uc.y - 0.05, w: 5.0, h: 0.48,
        fill: { color: C_CARD },
        line: { color: uc.col, width: 1 }
      });
      slide.addText(uc.name, {
        x: 4.2, y: uc.y, w: 4.8, h: 0.38,
        fontSize: 9.5, bold: true, color: C_WHITE, fontFace: 'Arial', align: 'center'
      });
    });

    // Actor 3: Mesin Otomatis
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 9.7, y: 2.4, w: 2.8, h: 3.7,
      fill: { color: C_CARD },
      line: { color: C_AMBER, width: 2 },
      rectRadius: 0.1
    });
    slide.addText('⚙️ AKTOR SISTEM:\nMESIN MONITORING & SOCKET', {
      x: 9.8, y: 2.6, w: 2.6, h: 0.5,
      fontSize: 12, bold: true, color: C_AMBER, fontFace: 'Arial', align: 'center'
    });
    slide.addText('• Siklus Ping ICMP/TCP Otomatis (15s)\n• Deteksi Kegagalan & Packet Loss\n• Auto-Create Tiket Insiden DOWN\n• Kalkulasi Agregasi 4 ISP\n• Siaran WebSocket Real-Time Event\n• Pencatatan Log Audit Sistem', {
      x: 9.8, y: 3.3, w: 2.6, h: 2.6,
      fontSize: 9.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 16
    });
  }

  // ==========================================
  // SLIDE 5: DIAGRAM ARSITEKTUR ANTIGRAVITY (BARU)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Diagram Arsitektur Sistem Antigravity', 'Arsitektur Software', 5);

    const layers = [
      {
        name: '1. PRESENTATION & MULTIPLATFORM CLIENT LAYER',
        color: C_EMERALD,
        y: 1.7,
        h: 1.0,
        desc: '• Web NOC Dashboard (Tailwind CSS, Glassmorphism, Chart.js, Interactive Campus Map)\n• Progressive Web App (PWA Service Worker, Offline Asset Cache, App Manifest)\n• Android Native Container (Capacitor Runtime, Standalone APK Installer)'
      },
      {
        name: '2. REAL-TIME COMMUNICATION LAYER (WEBSOCKET EVENT BUS)',
        color: C_SKY,
        y: 2.85,
        h: 0.9,
        desc: '• Socket.io Provider: Siaran event bi-directional (device:update, bandwidth:telemetry, incident:alert)\n• Otomatis sinkronisasi tanpa reload halaman dengan delay sub-detik (< 100ms)'
      },
      {
        name: '3. APPLICATION CORE & CONTROLLER LAYER (EXPRESS.JS REST API)',
        color: C_PURPLE,
        y: 3.9,
        h: 1.1,
        desc: '• AuthController (Autentikasi sesi & proteksi rute)\n• DeviceController (CRUD & validasi IP/MAC)\n• DiagnosticController (Quick Ping & Traceroute)\n• IncidentController & ReportController (SLA CSV)'
      },
      {
        name: '4. BACKGROUND ENGINE SERVICES & PROBE WORKERS',
        color: C_AMBER,
        y: 5.15,
        h: 0.95,
        desc: '• MonitorEngine: Penjadwalan ICMP/TCP ping berkala (15 detik) ke 28 target perangkat\n• BandwidthService: Telemetri agregasi 4 ISP (Citra, Indibiz, Starlink, Starlite)\n• HardwareService & AlertService (Anti-spam alert throttling)'
      },
      {
        name: '5. ATOMIC PERSISTENCE & AUDIT LOG LAYER',
        color: C_ROSE,
        y: 6.25,
        h: 0.75,
        desc: '• LowDB JSON Atomic Engine (unugha_netwatch_db.json) • Audit Trail Record • Settings Store'
      }
    ];

    layers.forEach(ly => {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y: ly.y, w: 11.6, h: ly.h,
        fill: { color: C_CARD },
        line: { color: ly.color, width: 1.5 },
        rectRadius: 0.08
      });

      slide.addText(ly.name, {
        x: 1.0, y: ly.y + 0.08, w: 11.2, h: 0.28,
        fontSize: 11, bold: true, color: ly.color, fontFace: 'Arial'
      });
      slide.addText(ly.desc, {
        x: 1.0, y: ly.y + 0.34, w: 11.2, h: ly.h - 0.4,
        fontSize: 9.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 14
      });
    });
  }

  // ==========================================
  // SLIDE 6: DIAGRAM SEKUENSI (SEQUENCE DIAGRAM) (BARU)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Diagram Sekuensi (Sequence Diagram: Siklus Monitoring & Insiden)', 'Pemodelan Perilaku', 6);

    // Lifeline Headers
    const lifelines = [
      { name: 'Timer\nScheduler', x: 0.8, col: C_MUTED },
      { name: 'Monitor\nEngine', x: 2.7, col: C_SKY },
      { name: 'Ping\nService', x: 4.6, col: C_AMBER },
      { name: 'Hardware\n(Ruijie/AP)', x: 6.5, col: C_ROSE },
      { name: 'Database\n(db.js)', x: 8.4, col: C_EMERALD },
      { name: 'Socket.io\nProvider', x: 10.3, col: C_PURPLE }
    ];

    lifelines.forEach(lf => {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: lf.x, y: 1.7, w: 1.7, h: 0.55,
        fill: { color: C_CARD },
        line: { color: lf.col, width: 1.5 },
        rectRadius: 0.08
      });
      slide.addText(lf.name, {
        x: lf.x, y: 1.72, w: 1.7, h: 0.5,
        fontSize: 9.5, bold: true, color: lf.col, fontFace: 'Arial', align: 'center'
      });
      // Vertical lifeline
      slide.addShape(pptx.shapes.LINE, {
        x: lf.x + 0.85, y: 2.3, w: 0, h: 4.6,
        line: { color: '334155', width: 1, dashType: 'dash' }
      });
    });

    // Sequence Steps / Arrows
    const steps = [
      { no: '1', text: 'tick() siklus 15s', from: 0.8 + 0.85, to: 2.7 + 0.85, y: 2.6, col: C_SKY },
      { no: '2', text: 'getMonitoredDevices()', from: 2.7 + 0.85, to: 8.4 + 0.85, y: 3.1, col: C_EMERALD },
      { no: '3', text: 'probeBatch(28 devices)', from: 2.7 + 0.85, to: 4.6 + 0.85, y: 3.6, col: C_AMBER },
      { no: '4', text: 'ICMP Echo / TCP Probe', from: 4.6 + 0.85, to: 6.5 + 0.85, y: 4.1, col: C_ROSE },
      { no: '5', text: '[Timeout / Unreachable]', from: 6.5 + 0.85, to: 4.6 + 0.85, y: 4.6, col: C_ROSE, dashed: true },
      { no: '6', text: 'result { status: DOWN, loss: 100% }', from: 4.6 + 0.85, to: 2.7 + 0.85, y: 5.1, col: C_AMBER, dashed: true },
      { no: '7', text: 'updateStatus() & createIncident()', from: 2.7 + 0.85, to: 8.4 + 0.85, y: 5.6, col: C_EMERALD },
      { no: '8', text: "broadcast('device:update', { status: 'DOWN' })", from: 2.7 + 0.85, to: 10.3 + 0.85, y: 6.1, col: C_PURPLE },
      { no: '9', text: 'emit ke Client UI -> Munculkan Alert Merah & Alarm', from: 10.3 + 0.85, to: 11.8, y: 6.6, col: C_EMERALD }
    ];

    steps.forEach(st => {
      slide.addShape(pptx.shapes.RIGHT_ARROW, {
        x: Math.min(st.from, st.to),
        y: st.y,
        w: Math.abs(st.to - st.from),
        h: 0.12,
        fill: { color: st.col }
      });
      slide.addText(`${st.no}. ${st.text}`, {
        x: Math.min(st.from, st.to),
        y: st.y - 0.25,
        w: Math.abs(st.to - st.from),
        h: 0.25,
        fontSize: 8.5,
        bold: true,
        color: C_WHITE,
        fontFace: 'Arial',
        align: 'center'
      });
    });
  }

  // ==========================================
  // SLIDE 7: DIAGRAM UML / CLASS DIAGRAM (BARU)
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Diagram Kelas UML & Relasi Data (UML Class Diagram)', 'Struktur Objek', 7);

    // Class 1: Device
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 3.6, h: 3.1,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 1.5 },
      rectRadius: 0.08
    });
    slide.addText('<<Entity>> Device', {
      x: 0.9, y: 1.8, w: 3.4, h: 0.35,
      fontSize: 12, bold: true, color: C_EMERALD, fontFace: 'Arial', align: 'center'
    });
    slide.addText('- id: String\n- name: String\n- ip: String (IPv4)\n- mac: String (EUI-48)\n- type: DeviceType\n- buildingId: String\n- status: Enum (UP/DOWN)\n- latency: Number (ms)\n- packetLoss: Number (%)\n- uptimePercentage: Number', {
      x: 0.9, y: 2.2, w: 3.4, h: 1.6,
      fontSize: 8.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 12
    });
    slide.addText('+ ping(): Promise<PingResult>\n+ updateStatus(status, latency): void\n+ calculateSla(): Number', {
      x: 0.9, y: 3.9, w: 3.4, h: 0.8,
      fontSize: 8.5, bold: true, color: C_SKY, fontFace: 'Arial', lineSpacing: 12
    });

    // Class 2: Incident
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.8, y: 1.7, w: 3.6, h: 3.1,
      fill: { color: C_CARD },
      line: { color: C_AMBER, width: 1.5 },
      rectRadius: 0.08
    });
    slide.addText('<<Entity>> Incident', {
      x: 4.9, y: 1.8, w: 3.4, h: 0.35,
      fontSize: 12, bold: true, color: C_AMBER, fontFace: 'Arial', align: 'center'
    });
    slide.addText('- id: String\n- deviceId: String\n- deviceName: String\n- severity: SeverityLevel\n- status: Enum (OPEN/ACK/RESOLVED)\n- startedAt: ISOString\n- resolvedAt: ISOString\n- acknowledgedBy: String\n- notes: String', {
      x: 4.9, y: 2.2, w: 3.4, h: 1.6,
      fontSize: 8.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 12
    });
    slide.addText('+ acknowledge(user): void\n+ resolve(notes): void\n+ getDowntimeMinutes(): Number', {
      x: 4.9, y: 3.9, w: 3.4, h: 0.8,
      fontSize: 8.5, bold: true, color: C_SKY, fontFace: 'Arial', lineSpacing: 12
    });

    // Class 3: Building
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8, y: 1.7, w: 3.6, h: 2.2,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1.5 },
      rectRadius: 0.08
    });
    slide.addText('<<Entity>> Building', {
      x: 8.9, y: 1.8, w: 3.4, h: 0.3,
      fontSize: 12, bold: true, color: C_SKY, fontFace: 'Arial', align: 'center'
    });
    slide.addText('- id: String\n- name: String\n- code: String (GH1, GH2, NOC)\n- totalDevices: Number\n- activeDevices: Number', {
      x: 8.9, y: 2.15, w: 3.4, h: 1.1,
      fontSize: 8.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 12
    });
    slide.addText('+ getHealthPercentage(): Number\n+ getDeviceList(): Device[]', {
      x: 8.9, y: 3.3, w: 3.4, h: 0.5,
      fontSize: 8.5, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });

    // Class 4: User & Auth
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 5.0, w: 3.6, h: 1.9,
      fill: { color: C_CARD },
      line: { color: C_PURPLE, width: 1.5 },
      rectRadius: 0.08
    });
    slide.addText('<<Entity>> User', {
      x: 0.9, y: 5.1, w: 3.4, h: 0.3,
      fontSize: 12, bold: true, color: C_PURPLE, fontFace: 'Arial', align: 'center'
    });
    slide.addText('- id: String\n- username: String\n- role: Enum (ADMIN, TECHNICIAN)\n- passwordHash: String\n+ verifyCredentials(pass): Boolean', {
      x: 0.9, y: 5.45, w: 3.4, h: 1.3,
      fontSize: 8.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 12
    });

    // Class 5: BandwidthSample & ISP
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.8, y: 5.0, w: 3.6, h: 1.9,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1.5 },
      rectRadius: 0.08
    });
    slide.addText('<<ValueObject>> BandwidthSample', {
      x: 4.9, y: 5.1, w: 3.4, h: 0.3,
      fontSize: 12, bold: true, color: C_SKY, fontFace: 'Arial', align: 'center'
    });
    slide.addText('- timestamp: Date\n- downloadMbps: Number\n- uploadMbps: Number\n- capacityMbps: 1050 Mbps\n- isps: Array<ISPTelemetry>', {
      x: 4.9, y: 5.45, w: 3.4, h: 1.3,
      fontSize: 8.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 12
    });

    // Class 6: AuditLog & Settings
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8, y: 4.1, w: 3.6, h: 2.8,
      fill: { color: C_CARD },
      line: { color: C_ROSE, width: 1.5 },
      rectRadius: 0.08
    });
    slide.addText('<<Entity>> AuditLog & Settings', {
      x: 8.9, y: 4.2, w: 3.4, h: 0.3,
      fontSize: 12, bold: true, color: C_ROSE, fontFace: 'Arial', align: 'center'
    });
    slide.addText('- id: String\n- timestamp: Date\n- action: String (LOGIN, CRUD, PING)\n- performedBy: String\n- details: Object\n\nSettings:\n- intervalSeconds: 15\n- timeoutSeconds: 3\n- latencyWarningThreshold: 120ms', {
      x: 8.9, y: 4.55, w: 3.4, h: 2.2,
      fontSize: 8.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 12
    });
  }

  // ==========================================
  // SLIDE 8: TOPOLOGI KAMPUS
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Arsitektur Infrastruktur & Topologi Multi-WAN', 'Infrastruktur', 8);

    const isps = [
      { name: 'ISP Citra', cap: '100 Mbps', role: 'Fiber Optic Dedicated' },
      { name: 'ISP Indibiz', cap: '200 Mbps', role: 'Telkom Fiber Backup' },
      { name: 'ISP Starlink', cap: '250 Mbps', role: 'Satelit LEO Low-Latency' },
      { name: 'ISP Starlite', cap: '500 Mbps', role: 'Backbone Utama Rektorat' }
    ];

    isps.forEach((isp, idx) => {
      const xPos = 0.8 + idx * 2.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: xPos, y: 1.7, w: 2.8, h: 1.3,
        fill: { color: C_CARD },
        line: { color: C_EMERALD, width: 1 },
        rectRadius: 0.1
      });
      slide.addText(isp.name, {
        x: xPos + 0.15, y: 1.85, w: 2.5, h: 0.3,
        fontSize: 12, bold: true, color: C_WHITE, fontFace: 'Arial'
      });
      slide.addText(`${isp.cap} • ${isp.role}`, {
        x: xPos + 0.15, y: 2.2, w: 2.5, h: 0.6,
        fontSize: 10, color: C_MUTED, fontFace: 'Arial'
      });
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 3.25, w: 11.6, h: 1.5,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('CORE GATEWAY & DISTRIBUTION SWITCH LAYER (NOC RACK SERVER REKTORAT)', {
      x: 1.1, y: 3.4, w: 11.0, h: 0.35,
      fontSize: 12, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText('• Ruijie Reyee RG-EG1510XS Multi-WAN Gateway (192.168.1.1) - Load Balancing & Policy Routing 4 ISP\n• Ruijie RG-NBS3100-24GT4SFP 24-Port Managed Switch (192.168.1.2) - Distribusi Fiber & VLAN Kampus\n• UNUGHA NetWatch Monitoring Server - Node.js Backend Engine & Socket.io Provider (Port 3000)', {
      x: 1.1, y: 3.8, w: 11.0, h: 0.85,
      fontSize: 11, color: C_WHITE, fontFace: 'Arial', lineSpacing: 18
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 5.0, w: 11.6, h: 1.8,
      fill: { color: C_CARD },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('DISTRIBUSI TITIK AKSES & BLOK GEDUNG KAMPUS UNUGHA', {
      x: 1.1, y: 5.15, w: 11.0, h: 0.3,
      fontSize: 12, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText('• Gedung Rektorat : NOC Server, Ruang Rektor, LPM, BAAK, Keuangan (Ruijie Reyee RG-RAP2260(E))\n• Gedung Hijau 1  : Lantai 1, Lantai 2 Sayap B, Lantai 3 Aula Utama\n• Gedung Hijau 2  : Lantai 1, Lantai 2, Lantai 3 Ruang Kuliah\n• FMIKOM & Perpus : Laboratorium Komputer, Ruang Dosen, Perpustakaan Lantai Atas & Bawah', {
      x: 1.1, y: 5.5, w: 11.0, h: 1.1,
      fontSize: 10.5, color: C_WHITE, fontFace: 'Arial', lineSpacing: 18
    });
  }

  // ==========================================
  // SLIDE 9: 4 PILAR FITUR
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Fitur Utama & Keunggulan Fungsional Sistem', 'Fitur Sistem', 9);

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
      const y = 1.7 + row * 2.55;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w: 5.7, h: 2.35,
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
  // SLIDE 10: METODOLOGI & TEST SUITES
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Jaminan Kualitas Perangkat Lunak & Metodologi Pengujian', 'Quality Assurance', 10);

    // Box 1: Unit Test Coverage
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 3.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🧪 Unit Testing (Jest)', {
      x: 1.0, y: 1.9, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• 10 Test Suites Lolos 100%\n', options: { bold: true, color: C_WHITE } },
      { text: '• 38 Unit Tests Terverifikasi\n\n', options: { color: C_WHITE } },
      { text: 'Cakupan Pengujian:\n', options: { bold: true, color: C_SKY } },
      { text: '1. Auth Controller & Session\n2. Device CRUD & Validation\n3. Incident Management SLA\n4. Bandwidth Aggregation Service\n5. Hardware Telemetry Service\n6. Ping Engine & Packet Loss\n7. Socket.io Event Broadcaster\n8. Audit Logger Engine', options: { color: C_MUTED } }
    ], {
      x: 1.0, y: 2.4, w: 3.2, h: 4.2,
      fontSize: 11, fontFace: 'Arial', lineSpacing: 17
    });

    // Box 2: Linter & Static Analysis
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.8, y: 1.7, w: 3.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🔍 ESLint v10 Flat Config', {
      x: 5.0, y: 1.9, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• 0 Errors, 0 Warnings\n', options: { bold: true, color: C_WHITE } },
      { text: '• Clean Code Standard\n\n', options: { color: C_WHITE } },
      { text: 'Pemeriksaan Otomatis:\n', options: { bold: true, color: C_EMERALD } },
      { text: '- Pencegahan memory leak pada event listener WebSocket\n- Validasi penanganan error async/await\n- Standar penamaan camelCase konsisten\n- Pembersihan unused variables', options: { color: C_MUTED } }
    ], {
      x: 5.0, y: 2.4, w: 3.2, h: 4.2,
      fontSize: 11, fontFace: 'Arial', lineSpacing: 17
    });

    // Box 3: TypeScript Compiler
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.8, y: 1.7, w: 3.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_AMBER, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🛡️ TypeScript Typecheck', {
      x: 9.0, y: 1.9, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: C_AMBER, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• 0 Type Errors (TSC)\n', options: { bold: true, color: C_WHITE } },
      { text: '• Tipe Data Ketat (JSDoc)\n\n', options: { color: C_WHITE } },
      { text: 'Keamanan Data:\n', options: { bold: true, color: C_SKY } },
      { text: '- Skema validasi objek perangkat (Device Model)\n- Integritas data format JSON\n- Pencegahan null pointer exception pada status latency & uptime', options: { color: C_MUTED } }
    ], {
      x: 9.0, y: 2.4, w: 3.2, h: 4.2,
      fontSize: 11, fontFace: 'Arial', lineSpacing: 17
    });
  }

  // ==========================================
  // SLIDE 11: TELEMETRI & HASIL EVALUASI
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Hasil Pengujian & Analisis Telemetri Jaringan UNUGHA', 'Hasil & Evaluasi', 11);

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
      x: 0.8, y: 1.7, w: 11.6, h: 2.2,
      border: { color: C_BORDER, pt: 1 },
      fill: { color: C_CARD },
      fontSize: 11,
      fontFace: 'Arial',
      align: 'center'
    });

    const highlights = [
      { num: '< 15 Detik', label: 'Waktu Deteksi Insiden (Down)', sub: 'Sebelumnya butuh 30-60 menit laporan manual' },
      { num: '1050 Mbps', label: 'Total Kapasitas Terpantau', sub: 'Multi-WAN Aggregation 4 ISP terintegrasi' },
      { num: '100%', label: 'Akurasi Sinkronisasi Inventaris', sub: 'Seluruh IP & MAC tercatat dan terhubung live ping' }
    ];

    highlights.forEach((hl, i) => {
      const x = 0.8 + i * 3.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 4.3, w: 3.7, h: 2.5,
        fill: { color: C_CARD },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.1
      });

      slide.addText(hl.num, {
        x: x + 0.2, y: 4.55, w: 3.3, h: 0.7,
        fontSize: 26, bold: true, color: C_EMERALD, fontFace: 'Arial', align: 'center'
      });

      slide.addText(hl.label, {
        x: x + 0.2, y: 5.25, w: 3.3, h: 0.5,
        fontSize: 12, bold: true, color: C_WHITE, fontFace: 'Arial', align: 'center'
      });

      slide.addText(hl.sub, {
        x: x + 0.2, y: 5.85, w: 3.3, h: 0.7,
        fontSize: 10, color: C_MUTED, fontFace: 'Arial', align: 'center'
      });
    });
  }

  // ==========================================
  // SLIDE 12: AKSESIBILITAS MOBILE & APK
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Aksesibilitas Multi-Platform & Distribusi Mobile APK', 'Portabilitas Sistem', 12);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 5.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_PURPLE, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('📱 Progressive Web App (PWA)', {
      x: 1.1, y: 1.95, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_PURPLE, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• Manifest PWA Lengkap: ', options: { bold: true, color: C_WHITE } },
      { text: 'Mendukung instalasi di Windows, Mac, iPad, Tablet, dan Android.\n\n', options: { color: C_MUTED } },
      { text: '• Service Worker Caching: ', options: { bold: true, color: C_WHITE } },
      { text: 'Mendukung akses offline untuk aset statis dan peta layout kampus.\n\n', options: { color: C_MUTED } },
      { text: '• Tampilan Responsif (Mobile-First): ', options: { bold: true, color: C_WHITE } },
      { text: 'Optimal pada berbagai resolusi layar tanpa kehilangan fungsionalitas NOC.', options: { color: C_MUTED } }
    ], {
      x: 1.1, y: 2.5, w: 5.0, h: 4.1,
      fontSize: 11.5, fontFace: 'Arial', lineSpacing: 20
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.7, w: 5.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🤖 Paket Aplikasi Android (APK Mandiri)', {
      x: 7.1, y: 1.95, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• Standalone Android APK: ', options: { bold: true, color: C_WHITE } },
      { text: 'Tersedia endpoint unduhan langsung di /api/download/apk.\n\n', options: { color: C_MUTED } },
      { text: '• QR Code Interaktif: ', options: { bold: true, color: C_WHITE } },
      { text: 'Modal download di navbar menyediakan QR code siap scan kamera smartphone penguji.\n\n', options: { color: C_MUTED } },
      { text: '• Runtime Capacitor Android: ', options: { bold: true, color: C_WHITE } },
      { text: 'Terintegrasi dengan AndroidManifest.xml dan Gradle project build.', options: { color: C_MUTED } }
    ], {
      x: 7.1, y: 2.5, w: 5.0, h: 4.1,
      fontSize: 11.5, fontFace: 'Arial', lineSpacing: 20
    });
  }

  // ==========================================
  // SLIDE 13: ALUR LIVE DEMO PENGUJI
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Alur & Skenario Live Demo di Depan Dewan Penguji', 'Skenario Demo', 13);

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
      const y = 1.7 + i * 1.02;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y, w: 11.6, h: 0.9,
        fill: { color: C_CARD },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.08
      });

      slide.addShape(pptx.shapes.OVAL, {
        x: 1.0, y: y + 0.17, w: 0.55, h: 0.55,
        fill: { color: C_EMERALD }
      });
      slide.addText(st.no, {
        x: 1.0, y: y + 0.17, w: 0.55, h: 0.55,
        fontSize: 14, bold: true, color: C_BG, fontFace: 'Arial', align: 'center'
      });

      slide.addText(st.title, {
        x: 1.7, y: y + 0.13, w: 3.5, h: 0.35,
        fontSize: 12, bold: true, color: C_WHITE, fontFace: 'Arial'
      });
      slide.addText(st.desc, {
        x: 5.2, y: y + 0.13, w: 7.0, h: 0.65,
        fontSize: 10.5, color: C_MUTED, fontFace: 'Arial', lineSpacing: 15
      });
    });
  }

  // ==========================================
  // SLIDE 14: KESIMPULAN & ROADMAP MASA DEPAN
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Kesimpulan & Rencana Pengembangan Masa Depan', 'Penutup', 14);

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.7, w: 5.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_EMERALD, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('📋 Kesimpulan Penelitian', {
      x: 1.1, y: 1.95, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_EMERALD, fontFace: 'Arial'
    });
    slide.addText([
      { text: '1. Sistem Berhasil Diimplementasikan: ', options: { bold: true, color: C_WHITE } },
      { text: 'UNUGHA NetWatch mampu memantau 28 node perangkat kampus dengan data valid & aktual secara real-time via WebSocket.\n\n', options: { color: C_MUTED } },
      { text: '2. Pemodelan Sistem Lengkap: ', options: { bold: true, color: C_WHITE } },
      { text: 'Terdokumentasi dalam Diagram Use Case, Arsitektur Antigravity, Diagram Sekuensi, dan Class Diagram UML terverifikasi.\n\n', options: { color: C_MUTED } },
      { text: '3. Kualitas Kode Teruji 100%: ', options: { bold: true, color: C_WHITE } },
      { text: '100% lulus Jest test coverage, 0 ESLint warning, 0 type errors, serta siap dijalankan di browser, tablet, dan smartphone Android (APK).', options: { color: C_MUTED } }
    ], {
      x: 1.1, y: 2.5, w: 5.0, h: 4.1,
      fontSize: 11, fontFace: 'Arial', lineSpacing: 18
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.7, w: 5.6, h: 5.1,
      fill: { color: C_CARD },
      line: { color: C_SKY, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText('🚀 Rencana Pengembangan Lanjutan', {
      x: 7.1, y: 1.95, w: 5.0, h: 0.4,
      fontSize: 16, bold: true, color: C_SKY, fontFace: 'Arial'
    });
    slide.addText([
      { text: '• Integrasi Protokol SNMP v3 & NetFlow:\n', options: { bold: true, color: C_WHITE } },
      { text: 'Membaca utilisasi bandwidth per-port pada switch Ruijie dan suhu prosesor perangkat NOC secara langsung.\n\n', options: { color: C_MUTED } },
      { text: '• Notifikasi Otomatis Bot Telegram / WhatsApp:\n', options: { bold: true, color: C_WHITE } },
      { text: 'Mengirimkan alarm instan darurat ke teknisi saat terjadi pemadaman jalur backbone kampus.\n\n', options: { color: C_MUTED } },
      { text: '• AI-Driven Anomaly Detection:\n', options: { bold: true, color: C_WHITE } },
      { text: 'Menerapkan machine learning untuk memprediksi degradasi performa kabel sebelum putus total.', options: { color: C_MUTED } }
    ], {
      x: 7.1, y: 2.5, w: 5.0, h: 4.1,
      fontSize: 11, fontFace: 'Arial', lineSpacing: 18
    });
  }

  // ==========================================
  // SLIDE 15: SESI TANYA JAWAB & PENUTUP
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG };

    slide.addText('SESI TANYA JAWAB (Q&A)', {
      x: 1.0, y: 1.7, w: 11.0, h: 0.4,
      fontSize: 14, bold: true, color: C_EMERALD, fontFace: 'Arial', align: 'center'
    });

    slide.addText('Terima Kasih', {
      x: 1.0, y: 2.2, w: 11.0, h: 1.2,
      fontSize: 50, bold: true, color: C_WHITE, fontFace: 'Arial', align: 'center'
    });

    slide.addText('Dewan Dosen Penguji, Dosen Pembimbing, & Seluruh Hadirin', {
      x: 1.0, y: 3.4, w: 11.0, h: 0.5,
      fontSize: 16, color: C_SKY, fontFace: 'Arial', align: 'center'
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 3.0, y: 4.3, w: 7.3, h: 2.1,
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
      x: 3.3, y: 4.5, w: 6.7, h: 1.7,
      fontSize: 12, fontFace: 'Arial', align: 'center', lineSpacing: 20
    });
  }

  // Output paths
  const outDir = path.join(__dirname, 'public', 'downloads');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'UNUGHA-NetWatch-Presentasi-Sidang.pptx');
  const outPathLengkap = path.join(outDir, 'UNUGHA-NetWatch-Presentasi-Lengkap.pptx');
  
  await pptx.writeFile({ fileName: outPath });
  fs.copyFileSync(outPath, outPathLengkap);
  console.log('✅ File presentasi PowerPoint 15 Slide berhasil dibuat di:', outPath);

  // Sync to C:\monitoring_unugha
  const mirrorDir = path.join('C:', 'monitoring_unugha', 'public', 'downloads');
  if (fs.existsSync(mirrorDir)) {
    fs.copyFileSync(outPath, path.join(mirrorDir, 'UNUGHA-NetWatch-Presentasi-Sidang.pptx'));
    fs.copyFileSync(outPath, path.join(mirrorDir, 'UNUGHA-NetWatch-Presentasi-Lengkap.pptx'));
    console.log('✅ File presentasi 15 Slide juga disalin ke C:\\monitoring_unugha');
  }
}

createPresentation().catch(err => {
  console.error('Error creating presentation:', err);
  process.exit(1);
});
