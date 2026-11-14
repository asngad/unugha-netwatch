const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');

const config = require('./config/config');
const socketService = require('./services/socketService');
const monitorEngine = require('./services/monitorEngine');
const bandwidthService = require('./services/bandwidthService');
const hardwareService = require('./services/hardwareService');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// Inisialisasi Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan Web Dashboard Statis
app.use(express.static(path.join(__dirname, '../public')));

// Pasang REST API Routes
app.use('/api', apiRoutes);

// Fallback untuk Single Page Application
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }
  next();
});

// Inisialisasi Socket.io WebSocket Provider
socketService.init(server);

function startServices() {
  monitorEngine.start();
  bandwidthService.start();
  hardwareService.start();
}

// Tangani error jika port bentrok (Otomatis coba port cadangan jika 3000 sibuk)
server.on('error', (e) => {
  const err = /** @type {any} */ (e);
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = config.port + 1;
    console.warn(`\n⚠️ Port ${config.port} sedang digunakan oleh proses lain.`);
    console.log(`🔄 Mengalihkan otomatis ke port alternatif: http://localhost:${fallbackPort} ...\n`);
    server.listen(fallbackPort, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(`🌐 UNUGHA NetWatch - Monitoring Jaringan Kampus`);
      console.log(`🏢 Kampus: ${config.campus.name}`);
      console.log(`🚀 Server aktif di: http://localhost:${fallbackPort}`);
      console.log(`📡 WebSocket siap melayani siaran real-time`);
      console.log('====================================================');
      startServices();
    });
  } else {
    console.error('Server error:', e);
    process.exit(1);
  }
});

// Jalankan Server & Background Monitoring Engine
server.listen(config.port, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🌐 UNUGHA NetWatch - Monitoring Jaringan Kampus`);
  console.log(`🏢 Kampus: ${config.campus.name}`);
  console.log(`🚀 Server aktif di: http://localhost:${config.port}`);
  console.log(`📡 WebSocket siap melayani siaran real-time`);
  console.log('====================================================');

  startServices();
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('Menutup server dengan aman...');
  monitorEngine.stop();
  bandwidthService.stop();
  hardwareService.stop();
  server.close(() => {
    process.exit(0);
  });
});
