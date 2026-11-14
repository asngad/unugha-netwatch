# 🌐 UNUGHA NetWatch
**Sistem Monitoring Jaringan Kampus Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap**

Aplikasi monitoring jaringan real-time berbasis **Node.js, Express, dan Socket.io** yang dirancang untuk memantau performa, latensi, uptime SLA, dan ketersediaan perangkat jaringan (*Core Router Mikrotik, Switch Distribusi Gedung, Access Point WiFi, dan Server Kampus SIAKAD/Web*).

Aplikasi ini dapat langsung dijalankan dan di-debug di **Visual Studio Code (VS Code)** hanya dengan tombol **F5** atau perintah `npm run dev`.

---

## 📑 Daftar Diagram Sistem

### 1. Diagram Use Case
Diagram ini menggambarkan interaksi para pengguna (*Admin NOC, Teknisi IT Lab, Pimpinan Kampus*) dan *Background Probe Worker* dengan fitur-fitur aplikasi.

```mermaid
flowchart LR
    Admin["Admin NOC UNUGHA"]
    Teknisi["Teknisi IT / Lab"]
    Pimpinan["Pimpinan Kampus / Kabag IT"]
    SystemWorker["Background Probe Worker"]

    subgraph NetWatchApp ["UNUGHA NetWatch System"]
        UC1["1. Manajemen Inventaris Perangkat & Gedung"]
        UC2["2. Pantau Dashboard & Topologi Jaringan Real-Time"]
        UC3["3. Eksekusi Auto-Ping (ICMP) & HTTP Health Check"]
        UC4["4. Analisis Latensi & Deteksi Status DOWN"]
        UC5["5. Notifikasi Alert Darurat (Telegram NOC)"]
        UC6["6. Diagnostik Manual (Ping Instan)"]
        UC7["7. Rekap Log Gangguan & Laporan SLA Uptime"]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC6
    Admin --> UC7

    Teknisi --> UC2
    Teknisi --> UC6

    Pimpinan --> UC2
    Pimpinan --> UC7

    SystemWorker --> UC3
    SystemWorker --> UC4
    UC4 -.->|trigger| UC5
    UC2 -.->|konsumsi data| UC4
```

---

### 2. Diagram Antigravity (Arsitektur Pipeline Sistem)
Diagram ini menjelaskan alur data holistik dari infrastruktur fisik jaringan kampus menuju telemetry collector, Node.js core engine, penyimpanan database embedded, hingga ke dashboard web visual dan gateway Telegram Bot.

```mermaid
flowchart TD
    subgraph CampusInfrastructure ["Infrastruktur Jaringan UNUGHA"]
        CoreRouter["Mikrotik Core Router CCR1036 (Rektorat)"]
        DistSwitches["Switch Distribusi (FTI, FKIP, FE, FSI)"]
        AccessPoints["Access Point WiFi Ruang Kelas & Asrama"]
        CampusServers["Server SIAKAD & Portal unugha.ac.id"]
    end

    subgraph CollectorLayer ["Engine Probes & Telemetry Collector"]
        IcmpWorker["ICMP Ping Probe (Latensi, Packet Loss)"]
        HttpWorker["HTTP/S Probe (Web Status 200 OK)"]
        Scheduler["Task Scheduler (Interval 15s)"]
    end

    subgraph CoreBackend ["Node.js Core Backend (Express.js)"]
        StateEngine["Status Evaluator & SLA Engine"]
        IncidentDetector{"Deteksi Gangguan (Loss > 0 / RTO?)"}
        AlertDispatcher["Alert Dispatcher Service"]
        SocketEngine["Socket.io WebSocket Provider"]
        RestAPI["REST API Router"]
    end

    subgraph Storage ["Penyimpanan Data Embedded"]
        JsonDB[("Embedded Database (unugha_netwatch_db.json)")]
    end

    subgraph ExternalAlerts ["Gateway Notifikasi Eksternal"]
        TelegramBot["Telegram Bot Notifier (@BotFather)"]
    end

    subgraph PresentationLayer ["Frontend Dashboard (VS Code Localhost:3000)"]
        WebDashboard["Dashboard NOC (HTML5 + Tailwind CSS)"]
        VisTopology["Peta Topologi Interaktif (Vis.js Network)"]
        ChartLatency["Grafik Latensi Real-Time (Chart.js)"]
    end

    Scheduler -->|Trigger Periodik| IcmpWorker & HttpWorker
    IcmpWorker -->|ICMP Echo| CoreRouter & DistSwitches & AccessPoints
    HttpWorker -->|HTTP HEAD/GET| CampusServers

    IcmpWorker & HttpWorker -->|Telemetry Raw Payload| StateEngine
    StateEngine --> IncidentDetector
    StateEngine -->|Simpan Metrik & State| JsonDB
    IncidentDetector -->|Status DOWN| AlertDispatcher
    AlertDispatcher -->|Kirim Peringatan| TelegramBot
    AlertDispatcher -->|Catat Insiden| JsonDB

    IncidentDetector -->|Status Normal / UP| SocketEngine
    SocketEngine -->|WebSocket Push Events| WebDashboard
    RestAPI <--> JsonDB
    WebDashboard --> VisTopology & ChartLatency
```

---

### 3. Diagram Sequence
Alur siklus pengecekan otomatis saat perangkat jaringan (misalnya Access Point Gedung FTI) mengalami putus koneksi (*DOWN/RTO*) hingga pemulihan kembali (*UP/Resolved*):

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin NOC
    participant UI as Dashboard Web (Socket.io)
    participant Server as Node.js Backend Server
    participant Worker as Ping Probe Worker
    participant DB as Embedded Database
    participant Target as AP-FTI-Lab-Multimedia (192.168.10.45)
    participant Bot as Telegram Bot API

    Note over Worker, Target: Siklus Pemantauan Berkala (Setiap 15 Detik)
    Worker->>Target: Kirim ICMP Echo Request (Ping)
    Target--xWorker: Request Timed Out (Tidak Ada Balasan)

    Worker->>Server: Laporan: DeviceID 'dev-ap-fti-lab', Status: DOWN, Loss: 100%
    Server->>DB: Update status = 'DOWN', catat incident_logs

    par Kirim Peringatan Darurat
        Server->>Bot: POST /sendMessage ("🚨 ALERT: AP Gedung FTI DOWN!")
        Bot-->>Admin: Pesan Notifikasi Masuk ke Telegram Admin
    and Pembaruan Real-Time Dashboard
        Server->>UI: Emit WebSocket ('incident:new', 'device:update')
        UI->>UI: Indikator Node berubah MERAH & bunyikan alarm audio
    end

    Note over Admin, Target: Teknisi Memperbaiki Kabel / Switch di Lokasi Kampus

    Worker->>Target: Siklus Pengecekan Selanjutnya: Ping ICMP
    Target->>Worker: ICMP Echo Reply (Latency: 4ms, Status: OK)
    Worker->>Server: Laporan: DeviceID 'dev-ap-fti-lab', Status: UP, Loss: 0%
    Server->>DB: Update status = 'UP', tandai incident RESOLVED

    par Kirim Notifikasi Pemulihan
        Server->>Bot: POST /sendMessage ("✅ PULIH: AP Gedung FTI kembali normal!")
        Bot-->>Admin: Pesan Pemulihan Masuk ke Telegram Admin
    and Pembaruan Real-Time Dashboard
        Server->>UI: Emit WebSocket ('incident:resolved', 'device:update')
        UI->>UI: Indikator Node kembali HIJAU
    end
```

---

### 4. Diagram UML

#### 4.1 Class Diagram (Struktur Entitas & Layanan Backend)
```mermaid
classDiagram
    class Device {
        +string id
        +string name
        +string type
        +string buildingId
        +string ip
        +string displayIp
        +string mac
        +string protocol
        +string status
        +int latency
        +float packetLoss
        +float uptimePercentage
        +bool isMonitored
    }

    class Building {
        +string id
        +string name
        +string code
        +string location
        +string color
        +string icon
    }

    class IncidentLog {
        +string id
        +string deviceId
        +string deviceName
        +string buildingName
        +string type
        +string message
        +datetime startedAt
        +datetime resolvedAt
        +string status
        +bool acknowledged
    }

    class MonitorEngine {
        -int intervalSeconds
        -bool isProbing
        +start() void
        +stop() void
        +restart() void
        +runCycle() Promise~void~
        +probeSingle(string deviceId) Promise~Object~
    }

    class PingService {
        +probe(Device dev, Object options) Promise~ProbeResult~
        +probeIcmp(string host, int timeout) Promise~ProbeResult~
        +probeHttp(string url, int timeout) Promise~ProbeResult~
    }

    class AlertService {
        +notifyDown(Device dev, IncidentLog inc) Promise~Object~
        +notifyRecovery(Device dev, int duration) Promise~Object~
        +sendTelegram(string text) Promise~Object~
        +sendTestMessage() Promise~Object~
    }

    class SocketService {
        -Server io
        +broadcastDeviceUpdate(Device dev) void
        +broadcastIncidentNew(IncidentLog inc) void
        +broadcastIncidentResolved(IncidentLog inc) void
        +broadcastSummary(Object summary) void
    }

    Building "1" -- "0..*" Device : menaungi
    Device "1" -- "0..*" IncidentLog : memiliki
    MonitorEngine --> PingService : menjalankan probe
    MonitorEngine --> AlertService : memicu notifikasi
    MonitorEngine --> SocketService : menyiarkan event WebSocket
    MonitorEngine --> Device : memantau & memperbarui state
```

#### 4.2 Component & Deployment Diagram di VS Code
```mermaid
flowchart TD
    subgraph VSCodeEnv ["Lingkungan Pengembangan Visual Studio Code (Localhost)"]
        subgraph EditorConfig ["Konfigurasi VS Code"]
            LaunchJSON[".vscode/launch.json (F5 Debugger)"]
            TasksJSON[".vscode/tasks.json (NPM Build Tasks)"]
            SettingsJSON[".vscode/settings.json"]
        end

        subgraph RuntimeProcess ["Node.js Runtime v26+"]
            ServerJS["src/server.js (HTTP Server Port 3000)"]
            MonitorEngineProc["Monitor Engine (Interval Scheduler)"]
            PingWorkerProc["ICMP & HTTP Probe Worker"]
            SocketIOServer["Socket.io WebSocket Provider"]
            EmbeddedDB[("data/unugha_netwatch_db.json")]
        end

        subgraph ClientBrowser ["Browser (Chrome / Edge / Firefox)"]
            NOCDashboard["Web Dashboard (http://localhost:3000)"]
        end
    end

    subgraph UNUGHANetwork ["Jaringan Kampus UNUGHA"]
        CoreMikrotik["Core Router (192.168.1.1)"]
        SwitchDistribusi["Distribution Switches (192.168.10.x - 30.x)"]
        AccessPointsCamp["WiFi Hotspot Kampus"]
        WebSIAKAD["siakad.unugha.ac.id"]
    end

    LaunchJSON -->|F5 Debug| ServerJS
    ServerJS <--> EmbeddedDB
    ServerJS --> MonitorEngineProc
    MonitorEngineProc --> PingWorkerProc
    PingWorkerProc -->|ICMP Ping & HTTP Check| UNUGHANetwork
    ServerJS --> SocketIOServer
    ClientBrowser <-->|HTTP GET / & REST API| ServerJS
    ClientBrowser <-->|WebSocket Real-time Stream| SocketIOServer
```

---

## 🚀 Panduan Menjalankan di Visual Studio Code (VS Code)

### 1. Buka Proyek di VS Code
1. Jalankan aplikasi **Visual Studio Code**.
2. Klik menu **File > Open Folder...** (atau tekan `Ctrl + K, Ctrl + O`).
3. Pilih folder:
   ```text
   c:\Users\asnga\Downloads\e-tahfidz\unugha-netwatch
   ```

### 2. Instalasi Dependensi (Jika Diperlukan)
Buka Terminal terintegrasi di VS Code (`Ctrl + \`` atau menu `Terminal > New Terminal`), lalu jalankan:
```bash
npm install
```

### 3. Menjalankan Aplikasi
Ada 2 cara yang sangat mudah:

#### Cara 1: Menggunakan Tombol F5 (One-Click Debugging)
- Cukup tekan tombol **F5** pada keyboard Anda.
- VS Code akan otomatis memilih konfigurasi `"▶️ Jalankan UNUGHA NetWatch (Nodemon Dev)"` dan memulai server dengan fitur hot-reload.

#### Cara 2: Melalui Terminal VS Code
Jalankan perintah berikut pada terminal:
```bash
npm run dev
```
*(Atau `npm start` untuk mode produksi).*

### 4. Akses Dashboard
Buka browser favorit Anda (Google Chrome / Microsoft Edge) dan ketik alamat:
```text
http://localhost:3000
```

---

## 🛠️ Fitur Utama Aplikasi

1. **Dashboard Real-Time**:
   - Kartu metrik: Total Perangkat, Online (UP), Peringatan (WARNING), Gangguan (DOWN), Rata-rata Latensi, dan Persentase Uptime SLA Kampus.
   - Live Pulse status WebSocket yang menunjukkan kondisi koneksi backend secara langsung.
2. **Monitoring Bandwidth & Traffic Uplink ISP (500 Mbps)**:
   - Telemetri throughput real-time interface Gateway Mikrotik (ether1-WAN Telkom Astinet).
   - Grafik dua jalur (Dual-Line Chart) untuk *Download (In)* dan *Upload (Out)* dalam satuan Mbps beserta bar persentase utilisasi link.
3. **Peta Topologi Interaktif & Denah Spasial Kampus**:
   - Ditenagai oleh *Vis.js Network*, memvisualisasikan hirarki hubungan dari Core Mikrotik Rektorat ke Switch Distribusi Gedung FTI, FSI, FKIP/FE, Perpustakaan, hingga ke Access Point dan Server Kampus.
   - Pilihan tampilan **Denah Spasial** tata letak fisik gedung kampus UNUGHA di Kesugihan, Cilacap.
   - Tombol satu-klik **"📸 Unduh PNG"** untuk mengekspor diagram topologi definisi tinggi untuk laporan akreditasi (LAM-INFOKOM/BAN-PT) atau skripsi mahasiswa.
4. **Konsol Diagnostik Interaktif (Web Terminal)**:
   - Terminal terintegrasi di browser (`unugha-noc@gateway:~$`) untuk menjalankan uji coba ping multi-paket kustom dan penelusuran rute *hop-by-hop* (*traceroute*).
5. **Simulasi Demo Failover (Kabel Putus)**:
   - Tombol **"⚡ Demo Failover"** di navbar untuk mendemonstrasikan secara langsung bagaimana sistem bereaksi saat terjadi gangguan kabel putus pada switch gedung, memicu alarm merah visual, notifikasi Telegram, dan kalkulasi SLA.
6. **Telemetri Perangkat Keras (Hardware Telemetry)**:
   - Pemantauan real-time CPU Load (%), RAM Usage (GB), dan Suhu Board (°C) untuk Router Core MikroTik CCR1036 serta VM Server SIAKAD.
7. **Grafik Latensi Real-Time**:
   - Menampilkan fluktuasi latensi rata-rata jaringan kampus secara langsung (*live streaming*) menggunakan Chart.js.
5. **Inventaris Perangkat Jaringan**:
   - Menampilkan daftar lengkap perangkat per gedung kampus.
   - Dilengkapi tombol **"Ping Langsung"** untuk pengujian diagnostik instan tanpa perlu membuka command prompt.
   - Fitur filter berdasarkan nama, alamat IP, gedung, atau status koneksi.
   - Modal form untuk menambah perangkat baru.
6. **Log Gangguan & Sistem Alert Telegram**:
   - Mencatat waktu mulai gangguan, durasi insiden, dan waktu pemulihan.
   - Mendukung integrasi bot Telegram dengan format pesan rapi berstandar NOC.
   - Audio peringatan interaktif sintetis via Web Audio API.
7. **Sistem Multi-User & Hak Akses (RBAC)**:
   - **ADMIN_NOC** (`admin` / `adminunugha`): Akses penuh kelola perangkat, pengaturan notifikasi, & kontrol.
   - **TEKNISI** (`teknisi` / `teknisiunugha`): Hak akses operator, diagnostik ping instan, dan *acknowledge* insiden gangguan.
   - **PIMPINAN** (`rektorat` / `rektoratunugha`): Hak akses eksekutif *read-only* dengan akses khusus laporan SLA.
8. **Laporan Resmi SLA & Ekspor Cetak / PDF / CSV**:
   - Dokumen laporan resmi berformat **Kop Surat Universitas Nahdlatul Ulama Al Ghazali Cilacap**.
   - Dilengkapi tabel SLA per gedung, MTTR (Mean Time to Resolution), dan kolom tanda tangan pimpinan.
   - Tombol satu klik **"Cetak / Simpan PDF"** (menggunakan dialog cetak browser dengan layout `@media print` rapi).
   - Tombol **"Download CSV"** untuk arsip dan pengolahan data di Microsoft Excel.

---

## 📁 Struktur Direktori

```text
unugha-netwatch/
├── .vscode/
│   ├── launch.json              # Konfigurasi F5 Debugging di VS Code
│   ├── tasks.json               # Tugas otomatis npm dev/start
│   └── settings.json            # Rekomendasi formatting VS Code
├── data/
│   └── unugha_netwatch_db.json  # Database embedded (otomatis tersimpan)
├── public/
│   ├── css/
│   │   └── style.css            # Styling modern tema NOC UNUGHA
│   ├── js/
│   │   └── app.js               # Logika Socket.io, Chart.js, & Vis.js
│   └── index.html               # Halaman utama Single Page Application
├── src/
│   ├── config/
│   │   └── config.js            # Pengaturan port, interval, & metadata kampus
│   ├── controllers/
│   │   ├── deviceController.js  # CRUD & manual ping handler
│   │   ├── incidentController.js# Pengelolaan insiden & acknowledge
│   │   └── statController.js    # Agregat statistik, topologi, & setting
│   ├── database/
│   │   ├── db.js                # Engine data persistence JSON
│   │   └── seeds.js             # Data master gedung & perangkat awal UNUGHA
│   ├── routes/
│   │   └── api.js               # Definisi endpoint REST API
│   ├── services/
│   │   ├── alertService.js      # Notifikasi Telegram Bot
│   │   ├── monitorEngine.js     # Background auto-probe scheduler
│   │   ├── pingService.js       # Driver probe ICMP & HTTP
│   │   └── socketService.js     # Penyedia WebSocket Socket.io
│   └── server.js                # Entry point aplikasi Express
├── .env.example                 # Contoh file konfigurasi environment
├── .env                         # Konfigurasi variabel lingkungan aktif
├── package.json                 # Metadata proyek & dependensi
└── README.md                    # Dokumentasi lengkap & diagram
```

---

*Dikembangkan untuk Pusat Komputer & Jaringan (Puskom) Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap.*
