const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

/* =====================
   HEALTH CHECK (Frontend cần)
===================== */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/* =====================
   ADMIN LOGIN (Frontend cần)
===================== */
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

/* =====================
   SERVER KEY MIDDLEWARE
===================== */
function checkServerKey(req, res, next) {
  const sk = req.headers['x-server-key'];
  if (!sk) return res.status(403).json({ error: 'Missing ServerKey' });

  db.get(
    "SELECT * FROM server_keys WHERE key=? AND status='active'",
    [sk],
    (err, row) => {
      if (!row) return res.status(403).json({ error: 'Invalid ServerKey' });
      next();
    }
  );
}

/* =====================
   CREATE SERVER KEY (ADMIN)
===================== */
app.post('/admin/serverkey', (req, res) => {
  const key = 'SERVER-' + Math.random().toString(36).slice(2, 18);
  db.run("INSERT INTO server_keys(key) VALUES(?)", [key]);
  res.json({ serverKey: key });
});

/* =====================
   LICENSE KEY MANAGEMENT
===================== */
app.post('/admin/key/create', (req, res) => {
  const key = 'KEY-' + Math.random().toString(36).slice(2, 10);
  db.run("INSERT INTO license_keys(key) VALUES(?)", [key]);
  res.json({ key });
});

app.post('/admin/key/lock', (req, res) => {
  db.run("UPDATE license_keys SET status='locked' WHERE key=?", [req.body.key]);
  res.json({ ok: true });
});

app.post('/admin/key/reset', (req, res) => {
  db.run("UPDATE license_keys SET hwid=NULL WHERE key=?", [req.body.key]);
  res.json({ ok: true });
});

app.post('/admin/key/delete', (req, res) => {
  db.run("DELETE FROM license_keys WHERE key=?", [req.body.key]);
  res.json({ ok: true });
});

/* =====================
   API VERIFY (ANDROID / SHELL)
===================== */
app.post('/api/verify', checkServerKey, (req, res) => {
  const { key, hwid } = req.body;

  db.get("SELECT * FROM license_keys WHERE key=?", [key], (err, row) => {
    if (!row) return res.json({ status: 'invalid' });
    if (row.status !== 'active') return res.json({ status: 'locked' });
    if (row.hwid && row.hwid !== hwid)
      return res.json({ status: 'hwid_mismatch' });

    res.json({ status: 'valid', expire: row.expire });
  });
});

/* =====================
   START SERVER (Render OK)
===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
