require('dotenv').config();
const path = require('path');

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',
  campus: {
    name: process.env.CAMPUS_NAME || 'Universitas Nahdlatul Ulama Al Ghazali (UNUGHA)',
    location: process.env.CAMPUS_LOCATION || 'Cilacap, Jawa Tengah'
  },
  monitoring: {
    intervalSeconds: parseInt(process.env.PING_INTERVAL_SECONDS, 10) || 15,
    timeoutSeconds: parseInt(process.env.PING_TIMEOUT_SECONDS, 10) || 2,
    packetCount: parseInt(process.env.PING_PACKET_COUNT, 10) || 2,
    latencyWarningThresholdMs: parseInt(process.env.LATENCY_WARNING_THRESHOLD_MS, 10) || 120
  },
  telegram: {
    enabled: process.env.TELEGRAM_ALERTS_ENABLED === 'true',
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || ''
  },
  paths: {
    dataDir: path.join(__dirname, '../../data'),
    dbFile: path.join(__dirname, '../../data/unugha_netwatch_db.json')
  }
};
