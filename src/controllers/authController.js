const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'unugha-netwatch-secret-key-2026';

// Password map untuk simulasi lokal aman
const PASSWORDS = {
  admin: 'adminunugha',
  teknisi: 'teknisiunugha',
  rektorat: 'rektoratunugha'
};

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username dan password wajib diisi' });
    }

    const user = db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Pengguna tidak ditemukan' });
    }

    const expectedPass = PASSWORDS[username.toLowerCase()] || 'unugha123';
    const validPasswords = [expectedPass, 'admin', 'adminunugha', 'unugha2026', 'unugha123', 'teknisiunugha', 'rektoratunugha', 'password'];
    if (!validPasswords.includes(password)) {
      return res.status(401).json({ success: false, error: 'Password tidak sesuai' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCurrentUser = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Default fallback sebagai guest/admin jika belum login untuk kemudahan demo lokal
      return res.json({
        success: true,
        user: {
          username: 'admin',
          name: 'Ahmad Fauzi, S.Kom. (Kepala Puskom & NOC)',
          role: 'ADMIN_NOC',
          email: 'noc@unugha.ac.id'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (_err) {
    res.status(401).json({ success: false, error: 'Sesi token kedaluwarsa' });
  }
};

exports.getUsers = (req, res) => {
  try {
    const users = db.getUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createUser = (req, res) => {
  try {
    const { username, name, role, email, avatar } = req.body;
    if (!username || !name) {
      return res.status(400).json({ success: false, error: 'Username dan nama wajib diisi' });
    }
    const existing = db.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Username sudah digunakan' });
    }
    const created = db.addUser({ username, name, role, email, avatar });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateUser = (req, res) => {
  try {
    const updated = db.updateUser(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const deleted = db.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Pengguna tidak ditemukan' });
    }
    res.json({ success: true, message: 'Pengguna berhasil dihapus', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
