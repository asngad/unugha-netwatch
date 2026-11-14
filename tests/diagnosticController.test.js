const diagnosticController = require('../src/controllers/diagnosticController');

describe('DiagnosticController Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('ping returns 400 when host is missing', async () => {
    await diagnosticController.ping(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('ping returns ping results when valid host provided', async () => {
    req.body = { host: '127.0.0.1', count: 1 };
    await diagnosticController.ping(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ host: '127.0.0.1' })
      })
    );
  });

  test('traceroute returns 400 when target is missing', async () => {
    await diagnosticController.traceroute(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('traceroute returns trace path for target', async () => {
    req.body = { target: '10.27.51.12' };
    await diagnosticController.traceroute(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ hops: 3 })
      })
    );
  });

  test('getHardware returns hardware telemetry', () => {
    diagnosticController.getHardware(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Object)
      })
    );
  });
});
