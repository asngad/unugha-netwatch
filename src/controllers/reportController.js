const db = require('../database/db');
const bandwidthService = require('../services/bandwidthService');

exports.getSlaReport = (req, res) => {
  try {
    const report = db.getSlaReport();
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.exportCsv = (req, res) => {
  try {
    const report = db.getSlaReport();
    const rows = [];

    // Header Metadata
    rows.push(['REKAPITULASI KINERJA & SLA JARINGAN KAMPUS UNUGHA CILACAP']);
    rows.push([`Periode: ${report.period}`]);
    rows.push([`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`]);
    rows.push([`Rata-rata Ketersediaan Global: ${report.overallSla}%`]);
    rows.push([]);

    // Table Header
    rows.push([
      'No',
      'Kode Gedung',
      'Nama Gedung / Fakultas',
      'Jumlah Perangkat',
      'SLA Uptime (%)',
      'Total Insiden',
      'Total Downtime (Menit)',
      'MTTR Rata-rata (Menit)'
    ]);

    report.buildingReports.forEach((bld, idx) => {
      rows.push([
        idx + 1,
        `"${bld.buildingCode}"`,
        `"${bld.buildingName}"`,
        bld.deviceCount,
        `${bld.uptimePercentage}%`,
        bld.incidentCount,
        bld.totalDowntimeMinutes,
        bld.mttrMinutes
      ]);
    });

    rows.push([]);
    rows.push(['DAFTAR INSIDEN GANGGUAN TERAKHIR']);
    rows.push(['ID Insiden', 'Perangkat', 'Gedung', 'Waktu Mulai', 'Waktu Selesai', 'Status', 'Keterangan']);

    report.recentIncidents.forEach(inc => {
      rows.push([
        `"${inc.id}"`,
        `"${inc.deviceName}"`,
        `"${inc.buildingName}"`,
        `"${new Date(inc.startedAt).toLocaleString('id-ID')}"`,
        inc.resolvedAt ? `"${new Date(inc.resolvedAt).toLocaleString('id-ID')}"` : '"Sedang Ditangani"',
        `"${inc.status}"`,
        `"${inc.message.replace(/"/g, '""')}"`
      ]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Laporan_SLA_Jaringan_UNUGHA.csv"');
    res.status(200).send('\uFEFF' + csvContent); // Byte Order Mark for Excel UTF-8 compatibility
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getBandwidth = (req, res) => {
  try {
    const current = bandwidthService.getCurrent();
    const history = db.getRecentBandwidth(30);
    res.json({
      success: true,
      data: {
        current,
        history
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
