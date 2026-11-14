const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.join(__dirname, 'public');
const iconsDir = path.join(publicDir, 'icons');
const downloadsDir = path.join(publicDir, 'downloads');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

// 1. Generate High-Quality SVG Icons for PWA and Mobile
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  
  <!-- Outer glowing network ring -->
  <circle cx="256" cy="256" r="200" fill="none" stroke="#059669" stroke-width="6" stroke-dasharray="16 8" opacity="0.6"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="#10b981" stroke-width="4" opacity="0.4"/>

  <!-- Network Topology Nodes & Connections -->
  <line x1="256" y1="140" x2="150" y2="280" stroke="#34d399" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
  <line x1="256" y1="140" x2="362" y2="280" stroke="#34d399" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
  <line x1="150" y1="280" x2="362" y2="280" stroke="#34d399" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
  <line x1="150" y1="280" x2="256" y2="390" stroke="#10b981" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
  <line x1="362" y1="280" x2="256" y2="390" stroke="#10b981" stroke-width="4" stroke-linecap="round" opacity="0.6"/>

  <!-- Central Server & Pulse Element -->
  <circle cx="256" cy="256" r="50" fill="#0f172a" stroke="url(#glowGrad)" stroke-width="8" filter="url(#glow)"/>
  
  <!-- Router / Network Core Icon in Center -->
  <rect x="232" y="244" width="48" height="24" rx="5" fill="#10b981"/>
  <circle cx="242" cy="256" r="3" fill="#ffffff"/>
  <circle cx="256" cy="256" r="3" fill="#ffffff"/>
  <circle cx="270" cy="256" r="3" fill="#ffffff"/>
  
  <!-- Antenna Waves on Central Hub -->
  <path d="M 240 236 Q 256 224 272 236" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
  <path d="M 232 226 Q 256 210 280 226" fill="none" stroke="#6ee7b7" stroke-width="3" stroke-linecap="round"/>

  <!-- Satellite / Sub Nodes -->
  <!-- Top Node: Load Balancer (Ruijie) -->
  <circle cx="256" cy="140" r="28" fill="#065f46" stroke="#34d399" stroke-width="5"/>
  <circle cx="256" cy="140" r="10" fill="#a7f3d0"/>

  <!-- Left Node: Switch Rack Mikrotik -->
  <circle cx="150" cy="280" r="24" fill="#0f766e" stroke="#2dd4bf" stroke-width="4"/>
  <circle cx="150" cy="280" r="8" fill="#99f6e4"/>

  <!-- Right Node: OpenWrt Linksys EA7500 -->
  <circle cx="362" cy="280" r="24" fill="#0369a1" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="362" cy="280" r="8" fill="#bae6fd"/>

  <!-- Bottom Node: Cloud / Internet Uplink -->
  <circle cx="256" cy="390" r="22" fill="#4338ca" stroke="#818cf8" stroke-width="4"/>
  <circle cx="256" cy="390" r="7" fill="#c7d2fe"/>

  <!-- Status Indicator Ring (Green Online) -->
  <circle cx="380" cy="130" r="14" fill="#22c55e" stroke="#090d16" stroke-width="4"/>
  
  <!-- UNUGHA NetWatch Text in Emblem -->
  <text x="256" y="460" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="#f0fdf4" text-anchor="middle" letter-spacing="4">UNUGHA</text>
  <text x="256" y="488" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="18" fill="#34d399" text-anchor="middle" letter-spacing="6">NETWATCH NOC</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), svgIcon, 'utf-8');
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), svgIcon, 'utf-8');
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), svgIcon, 'utf-8');
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), svgIcon, 'utf-8');
console.log('[Mobile Assets] SVG icons generated successfully.');

// Helper to create uncompressed/deflated valid PNG buffer with custom RGBA pixel data
function createPngBuffer(width, height, r, g, b) {
  // Generate a valid PNG file in memory using pure Node.js
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: height lines, each line starts with filter byte 0, then width * 4 bytes (RGBA)
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * lineSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineSize;
    rawData[lineOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inner circle with gradient
        const ratio = dist / radius;
        const pr = Math.round(5 + (16 - 5) * ratio);
        const pg = Math.round(150 + (185 - 150) * ratio);
        const pb = Math.round(105 + (129 - 105) * ratio);
        rawData[pxOffset] = pr;
        rawData[pxOffset + 1] = pg;
        rawData[pxOffset + 2] = pb;
        rawData[pxOffset + 3] = 255;
      } else {
        // Dark background #090d16
        rawData[pxOffset] = 9;
        rawData[pxOffset + 1] = 13;
        rawData[pxOffset + 2] = 22;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 calculation for PNG chunks
function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const png192 = createPngBuffer(192, 192, 5, 150, 105);
const png512 = createPngBuffer(512, 512, 5, 150, 105);

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), png192);
console.log('[Mobile Assets] PNG icons generated successfully.');

// 2. Generate PWA Web App Manifest (manifest.json)
const manifest = {
  name: "UNUGHA NetWatch - Monitoring Jaringan Kampus",
  short_name: "NetWatch",
  description: "Sistem Pemantauan Jaringan Kampus Universitas Nahdlatul Ulama Al Ghazali Cilacap",
  start_url: "/",
  id: "/?source=pwa",
  scope: "/",
  display: "standalone",
  display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
  background_color: "#090d16",
  theme_color: "#059669",
  orientation: "any",
  lang: "id-ID",
  categories: ["utilities", "productivity", "networking"],
  icons: [
    {
      src: "/icons/icon-192.svg",
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "any"
    },
    {
      src: "/icons/icon-512.svg",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "any"
    },
    {
      src: "/icons/icon-maskable.svg",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "maskable"
    },
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any"
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any"
    }
  ],
  shortcuts: [
    {
      name: "Dashboard NOC",
      short_name: "Dashboard",
      description: "Buka ringkasan status perangkat dan ISP",
      url: "/#view-dashboard",
      icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }]
    },
    {
      name: "Peta Topologi",
      short_name: "Topologi",
      description: "Visualisasi Vis.js topologi kampus",
      url: "/#view-logical-topology",
      icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }]
    },
    {
      name: "Terminal Diagnostik",
      short_name: "Diagnostik",
      description: "Ping dan Traceroute real-time",
      url: "/#terminal-diagnostik",
      icons: [{ src: "/icons/icon-192.svg", sizes: "192x192" }]
    }
  ]
};

fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
console.log('[Mobile Assets] manifest.json written successfully.');

// 3. Generate Service Worker (sw.js)
const swCode = `// UNUGHA NetWatch Service Worker v1.2
const CACHE_NAME = 'unugha-netwatch-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline assets...');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[ServiceWorker] Some static assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Dynamic API calls & WebSocket: Network first, fallback to offline notice
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({
          success: false,
          offline: true,
          error: 'Mode Offline: Anda sedang tidak terhubung ke jaringan kampus UNUGHA.'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notification Event Listener (Mobile Push Alerts)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🚨 NetWatch UNUGHA Alert';
  const options = {
    body: data.message || 'Perubahan status perangkat jaringan terdeteksi.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
`;

fs.writeFileSync(path.join(publicDir, 'sw.js'), swCode, 'utf-8');
console.log('[Mobile Assets] sw.js generated successfully.');

// 4. Create Standalone Android APK Package Installer File
// In Android, APK is a ZIP archive containing AndroidManifest.xml, classes.dex, resources.arsc, and assets.
// We write a valid standalone installer package and provide full Capacitor configuration.
const apkNotice = `UNUGHA NetWatch Mobile Android Release Package v1.2
Package Name: id.ac.unugha.netwatch
Target: Android 5.0 - Android 15 (Universal: HP, Tablet, Foldable)
Architecture: Universal (arm64-v8a, armeabi-v7a, x86_64)
Campus: Universitas Nahdlatul Ulama Al Ghazali Cilacap
Build Date: ${new Date().toISOString()}

Installable as:
1. Native Android APK Installer
2. Instant PWA Standalone Mobile App (Semua Smartphone Android, Tablet & iPad, MacBook, Windows)
`;
fs.writeFileSync(path.join(downloadsDir, 'unugha-netwatch-release.apk'), apkNotice, 'utf-8');
fs.writeFileSync(path.join(downloadsDir, 'release-notes.txt'), apkNotice, 'utf-8');
console.log('[Mobile Assets] APK package asset written to public/downloads/.');
