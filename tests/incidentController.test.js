const incidentController = require('../src/controllers/incidentController');
const db = require('../src/database/db');

describe('IncidentController Unit Tests', () => {
  let req, res;
  let testIncId;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterAll(() => {
    if (testIncId) {
      db.deleteIncident(testIncId);
    }
  });

  test('getIncidents returns array of incidents', () => {
    incidentController.getIncidents(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Array)
      })
    );
  });

  test('getIncidentById returns 404 for nonexistent incident', () => {
    req.params = { id: 'non-existent-inc-999' };
    incidentController.getIncidentById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getIncidentById, updateIncident, acknowledgeIncident, and deleteIncident with created incident', () => {
    const inc = db.createIncident({
      deviceId: 'dev-lb-eg1510xs',
      deviceName: 'Load Balancer EG1510XS',
      buildingName: 'NOC Rektorat',
      message: 'Uji Gangguan Incident Controller'
    });
    testIncId = inc.id;

    req.params = { id: testIncId };
    incidentController.getIncidentById(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: testIncId })
      })
    );

    req.body = { notes: 'Catatan teknisi sudah dicek' };
    incidentController.updateIncident(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ notes: 'Catatan teknisi sudah dicek' })
      })
    );

    incidentController.acknowledgeIncident(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ acknowledged: true })
      })
    );

    incidentController.deleteIncident(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
    testIncId = null;
  });
});
