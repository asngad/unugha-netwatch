const deviceController = require('../src/controllers/deviceController');
const db = require('../src/database/db');

describe('DeviceController Unit Tests', () => {
  let req, res;
  let testDevId;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterAll(() => {
    if (testDevId) {
      db.deleteDevice(testDevId);
    }
  });

  test('getAllDevices returns list of campus devices', () => {
    deviceController.getAllDevices(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Array)
      })
    );
  });

  test('createDevice validates required fields and creates device', async () => {
    req.body = {
      name: 'Test Device Unit Jest',
      type: 'access_point',
      buildingId: 'bld-rek',
      ip: '10.27.51.200',
      displayIp: '10.27.51.200'
    };
    await deviceController.createDevice(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const callArg = res.json.mock.calls[0][0];
    expect(callArg.success).toBe(true);
    testDevId = callArg.data.id;
  });

  test('getDeviceById returns 404 for nonexistent device', () => {
    req.params = { id: 'non-existent-id-999' };
    deviceController.getDeviceById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateDevice updates device fields', () => {
    req.params = { id: testDevId };
    req.body = { name: 'Test Device Unit Jest Renamed' };
    deviceController.updateDevice(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ name: 'Test Device Unit Jest Renamed' })
      })
    );
  });

  test('deleteDevice removes device', () => {
    req.params = { id: testDevId };
    deviceController.deleteDevice(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
    testDevId = null;
  });
});
