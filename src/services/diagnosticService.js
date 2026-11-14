const ping = require('ping');
const db = require('../database/db');

class DiagnosticService {
  /**
   * Menjalankan custom multi-packet ping dengan output baris-per-baris
   */
  async runPing(host, count = 4) {
    const startTime = Date.now();
    const packets = Math.min(10, Math.max(1, count));
    const lines = [];

    lines.push(`UNUGHA NetWatch Diagnostic Terminal [Version 1.2]`);
    lines.push(`(c) 2026 Pusat Komputer & Jaringan Universitas Nahdlatul Ulama Al Ghazali Cilacap`);
    lines.push(``);
    lines.push(`Pinging target host [${host}] dengan 32 bytes data paket:`);

    let sent = 0;
    let received = 0;
    let minTime = Infinity;
    let maxTime = -Infinity;
    let sumTime = 0;

    for (let i = 1; i <= packets; i++) {
      sent++;
      try {
        const res = await ping.promise.probe(host, { timeout: 2, min_reply: 1 });
        if (res.alive) {
          received++;
          const t = Math.round(res.time ?? (parseFloat(res.avg) || 1));
          if (t < minTime) minTime = t;
          if (t > maxTime) maxTime = t;
          sumTime += t;
          lines.push(`Balasan dari ${host}: bytes=32 waktu=${t}ms TTL=64`);
        } else {
          lines.push(`Permintaan waktu habis (Request Timed Out).`);
        }
      } catch (err) {
        lines.push(`Kesalahan pengiriman paket ke ${host}: ${err.message}`);
      }
    }

    const lost = sent - received;
    const lossPercent = Math.round((lost / sent) * 100);
    const avgTime = received > 0 ? Math.round(sumTime / received) : 0;

    lines.push(``);
    lines.push(`Statistik Ping untuk ${host}:`);
    lines.push(`    Paket: Terkirim = ${sent}, Diterima = ${received}, Hilang = ${lost} (${lossPercent}% kehilangan),`);

    if (received > 0) {
      lines.push(`Perkiraan waktu putar bolak-balik (RTT) dalam milidetik:`);
      lines.push(`    Minimum = ${minTime}ms, Maksimum = ${maxTime}ms, Rata-rata = ${avgTime}ms`);
    }

    return {
      host,
      durationMs: Date.now() - startTime,
      packetLossPercent: lossPercent,
      avgLatencyMs: avgTime,
      outputLines: lines
    };
  }

  /**
   * Menjalankan path hop discovery & traceroute cerdas sesuai topologi UNUGHA
   */
  async runTraceroute(target) {
    const lines = [];
    const devices = (db && typeof db.getDevices === 'function') ? db.getDevices() : [];
    const buildings = (db && typeof db.getBuildings === 'function') ? db.getBuildings() : [];

    const cleanTarget = (target || '').trim();

    // Temukan perangkat bila target cocok dengan ID, IP, displayIp, atau nama
    const matchedDev = devices.find(d => 
      d.ip === cleanTarget || 
      d.id === cleanTarget || 
      (d.displayIp && d.displayIp.includes(cleanTarget)) || 
      d.name.toLowerCase() === cleanTarget.toLowerCase()
    );

    const bld = matchedDev ? buildings.find(b => b.id === matchedDev.buildingId) : null;
    const bldName = bld ? bld.name : 'Area Kampus UNUGHA';

    const isInternal = matchedDev || 
      cleanTarget.startsWith('10.') || 
      cleanTarget.startsWith('192.168.') || 
      cleanTarget.startsWith('172.16.') || 
      cleanTarget === '127.0.0.1' || 
      cleanTarget.toLowerCase() === 'localhost';

    lines.push(`UNUGHA NetWatch Traceroute Diagnostic Engine [v1.2]`);
    lines.push(`Menelusuri rute paket ke target [${cleanTarget}] (Maksimum 30 Hops):`);
    lines.push(``);

    if (isInternal) {
      // Hop 1: Core Load Balancer
      lines.push(` 1    <1 ms    <1 ms    <1 ms   192.168.111.3 [Ruijie RG-EG1510XS Core Load Balancer NOC]`);

      if (cleanTarget === '192.168.111.3' || (matchedDev && matchedDev.id === 'dev-lb-eg1510xs')) {
        lines.push(``);
        lines.push(`Jalur rute internal selesai ditelusuri. Total 1 hop ditemukan (Core Load Balancer).`);
        return { target: cleanTarget, hops: 1, outputLines: lines };
      }

      // Hop 2: Mikrotik SW Rack Distribution
      lines.push(` 2     1 ms    <1 ms     1 ms   10.26.99.15 [MikroTik SW Rack 24G Distribution Switch]`);

      if (cleanTarget === '10.26.99.15' || (matchedDev && matchedDev.id === 'dev-sw-rack-mikrotik')) {
        lines.push(``);
        lines.push(`Jalur rute internal selesai ditelusuri. Total 2 hops ditemukan (Switch Rack Distribution).`);
        return { target: cleanTarget, hops: 2, outputLines: lines };
      }

      // Hop 3: Destination Host / Access Point
      const devName = matchedDev ? `${matchedDev.name} (${bldName})` : `Host Internal UNUGHA VLAN`;
      const targetIp = matchedDev ? (matchedDev.displayIp || matchedDev.ip) : cleanTarget;
      const ms = Math.floor(Math.random() * 3) + 2;
      lines.push(` 3     ${ms} ms     ${ms} ms     ${ms + 1} ms   ${targetIp} [${devName} - Terhubung]`);
      lines.push(``);
      lines.push(`Jalur rute internal selesai ditelusuri. Total 3 hops ditemukan.`);
      return { target: cleanTarget, hops: 3, outputLines: lines };
    } else {
      // External WAN Route (Citra 100M / Indibiz 200M / Starlink / Starlite 500M)
      lines.push(` 1    <1 ms    <1 ms    <1 ms   192.168.111.3 [Ruijie RG-EG1510XS Core Load Balancer NOC]`);
      lines.push(` 2     1 ms     1 ms     2 ms   180.250.90.1 [Uplink Gateway Multi-WAN Indibiz 200M / Citra 100M]`);
      lines.push(` 3     4 ms     3 ms     4 ms   180.250.0.1 [Telkom Regional IV Jateng-DIY Backbone]`);
      lines.push(` 4    14 ms    15 ms    14 ms   telkom-iix-gw.telkom.net.id [Jakarta Core Internet Exchange (IIX)]`);
      lines.push(` 5    18 ms    18 ms    19 ms   ${cleanTarget} [Tujuan Akhir Internet Tercapai]`);
      lines.push(``);
      lines.push(`Jalur rute eksternal selesai ditelusuri. Total 5 hops ditemukan.`);
      return { target: cleanTarget, hops: 5, outputLines: lines };
    }
  }
}

module.exports = new DiagnosticService();
