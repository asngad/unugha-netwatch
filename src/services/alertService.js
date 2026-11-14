const config = require('../config/config');
const db = require('../database/db');

class AlertService {
  constructor() {
    this.lastAlertTimestamps = new Map(); // Anti-spam throttling per device
  }

  /**
   * Mengirim notifikasi bahaya / Down ke Telegram Admin NOC
   */
  async notifyDown(device, incident) {
    const now = Date.now();
    const lastAlert = this.lastAlertTimestamps.get(device.id) || 0;

    // Minimal jeda 5 menit antar alert untuk perangkat yang sama agar tidak spamming
    if (now - lastAlert < 5 * 60 * 1000) {
      return { skipped: true, reason: 'Throttled (Anti-spam)' };
    }
    this.lastAlertTimestamps.set(device.id, now);

    const message = [
      `🚨 *[ALERT] GANGGUAN JARINGAN KAMPUS UNUGHA*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📍 *Perangkat:* \`${device.name}\``,
      `🏢 *Lokasi:* ${incident.buildingName}`,
      `🌐 *IP Target:* \`${device.displayIp || device.ip}\``,
      `⚠️ *Status:* *DOWN (TIDAK MERESPON)*`,
      `⏱️ *Waktu Deteksi:* ${new Date().toLocaleString('id-ID')}`,
      `📝 *Keterangan:* ${incident.message}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Sistem Pemantau NetWatch UNUGHA v1.0_`
    ].join('\n');

    return this.sendTelegram(message);
  }

  /**
   * Mengirim notifikasi pemulihan saat perangkat kembali UP
   */
  async notifyRecovery(device, durationMinutes = 0) {
    this.lastAlertTimestamps.delete(device.id);

    const message = [
      `✅ *[PULIH] JARINGAN UNUGHA KEMBALI NORMAL*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📍 *Perangkat:* \`${device.name}\``,
      `🏢 *Lokasi:* ${device.locationDescription || 'Kampus UNUGHA'}`,
      `🌐 *IP Target:* \`${device.displayIp || device.ip}\``,
      `⚡ *Status:* *UP (NORMAL)*`,
      `📶 *Latensi Saat Ini:* ${device.latency} ms`,
      `⏱️ *Waktu Pulih:* ${new Date().toLocaleString('id-ID')}`,
      durationMinutes > 0 ? `⏳ *Durasi Gangguan:* ~${durationMinutes} menit` : ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `_Sistem Pemantau NetWatch UNUGHA v1.0_`
    ].filter(Boolean).join('\n');

    return this.sendTelegram(message);
  }

  /**
   * Mengirim pesan manual atau pengujian koneksi Telegram Bot
   */
  async sendTestMessage(customText = null) {
    const text = customText || [
      `🔔 *[TEST] Notifikasi Uji Coba NetWatch UNUGHA*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Status integrasi Telegram Bot berhasil terhubung!`,
      `Waktu Server: ${new Date().toLocaleString('id-ID')}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━`
    ].join('\n');

    return this.sendTelegram(text);
  }

  /**
   * Helper internal pengirim request HTTP ke Telegram Bot API
   */
  async sendTelegram(text) {
    const settings = db.getSettings();
    const token = settings.telegramBotToken || config.telegram.botToken;
    const chatId = settings.telegramChatId || config.telegram.chatId;
    const enabled = settings.telegramEnabled || config.telegram.enabled;

    if (!enabled || !token || !chatId) {
      console.log(`[AlertService] (Simulasi/Disabled) Telegram Alert:\n${text}`);
      return { success: false, simulated: true, message: 'Telegram belum dikonfigurasi / disabled' };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      const data = /** @type {any} */ (await res.json());
      if (!data.ok) {
        console.error('[AlertService] Telegram API Error:', data.description);
        return { success: false, error: data.description };
      }

      return { success: true, messageId: data.result?.message_id };
    } catch (err) {
      console.error('[AlertService] Gagal mengirim pesan Telegram:', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new AlertService();
