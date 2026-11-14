const authController = require('../src/controllers/authController');

describe('AuthController Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('login returns 400 when username or password is missing', async () => {
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('login succeeds with admin username and alias password unugha2026', async () => {
    req.body = { username: 'admin', password: 'unugha2026' };
    await authController.login(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: expect.any(String),
        user: expect.objectContaining({ role: 'ADMIN_NOC' })
      })
    );
  });

  test('login rejects incorrect password with 401', async () => {
    req.body = { username: 'admin', password: 'wrongpassword' };
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('getCurrentUser returns fallback user when token is missing', () => {
    authController.getCurrentUser(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: expect.objectContaining({ role: 'ADMIN_NOC' })
      })
    );
  });
});
