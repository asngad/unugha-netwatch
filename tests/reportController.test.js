const reportController = require('../src/controllers/reportController');

describe('ReportController Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  test('getSlaReport returns overall SLA and building reports', () => {
    reportController.getSlaReport(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          overallSla: expect.any(Number),
          buildingReports: expect.any(Array)
        })
      })
    );
  });

  test('exportCsv sends CSV headers and spreadsheet content', () => {
    reportController.exportCsv(req, res);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('REKAPITULASI KINERJA & SLA'));
  });

  test('getBandwidth returns current bandwidth and historical samples', () => {
    reportController.getBandwidth(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          current: expect.any(Object),
          history: expect.any(Array)
        })
      })
    );
  });
});
