const ping = require('ping');

class PingService {
  /**
   * Melakukan probe ke sebuah perangkat (bisa ICMP ping atau HTTP check)
   * @param {Object} device Perangkat yang akan di-probe
   * @param {Object} options Konfigurasi timeout & packet count
   * @returns {Promise<Object>} Hasil pemeriksaan { alive, time, packetLoss, error }
   */
  async probe(device, options = {}) {
    const timeoutSec = options.timeoutSeconds || 2;
    const protocol = device.protocol || 'icmp';
    const targetHost = device.ip;

    if (protocol === 'http' || targetHost.startsWith('http://') || targetHost.startsWith('https://')) {
      return this.probeHttp(targetHost, timeoutSec);
    }

    return this.probeIcmp(targetHost, timeoutSec);
  }

  /**
   * Probe ICMP Ping menggunakan cross-platform ping CLI
   */
  async probeIcmp(host, timeoutSec) {
    try {
      const res = await ping.promise.probe(host, {
        timeout: timeoutSec,
        min_reply: 1
      });

      const latency = typeof res.time === 'number' && !isNaN(res.time) 
        ? Math.round(res.time) 
        : (parseFloat(res.avg) || null);

      const packetLoss = parseFloat(res.packetLoss) || (res.alive ? 0 : 100);

      return {
        alive: !!res.alive,
        latency: res.alive ? (latency ?? 1) : null,
        packetLoss: packetLoss,
        rawOutput: res.output
      };
    } catch (err) {
      return {
        alive: false,
        latency: null,
        packetLoss: 100,
        error: err.message
      };
    }
  }

  /**
   * Probe HTTP/HTTPS untuk server web kampus (SIAKAD, Portal UNUGHA)
   */
  async probeHttp(url, timeoutSec) {
    let target = url;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutSec * 1000);

    try {
      const response = await fetch(target, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'UNUGHA-NetWatch-Probe/1.0'
        }
      });
      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;
      const isOk = response.status >= 200 && response.status < 400;

      return {
        alive: isOk,
        latency: duration,
        packetLoss: isOk ? 0 : 100,
        statusCode: response.status
      };
    } catch (err) {
      clearTimeout(timeoutId);

      // Coba fallback dengan ICMP jika domain gagal via HTTPS
      try {
        const cleanHost = url.replace(/^https?:\/\//, '').split('/')[0];
        const icmpFallback = await this.probeIcmp(cleanHost, timeoutSec);
        if (icmpFallback.alive) {
          return icmpFallback;
        }
      } catch (_fallbackErr) {
        // Abaikan fallback error
      }

      return {
        alive: false,
        latency: null,
        packetLoss: 100,
        error: err.name === 'AbortError' ? 'HTTP Request Timeout' : err.message
      };
    }
  }
}

module.exports = new PingService();
