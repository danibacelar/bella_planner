// Saves Isabella's planner in Upstash Redis so her parents can see it.
// Env vars (set in Vercel, never in the repo):
//   STUDENT_CODE  - Isabella's code: can read and write
//   TEACHER_CODE  - parents' code: can only read
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  (or KV_REST_API_URL / KV_REST_API_TOKEN)
const crypto = require('crypto');

const KEY = 'isabella-planner:state';
const MAX_BYTES = 400000;

const same = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
};

async function redis(cmd) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || 'redis ' + r.status);
  return j.result;
}

module.exports = async (req, res) => {
  const send = (code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); };
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  const studentCode = process.env.STUDENT_CODE, teacherCode = process.env.TEACHER_CODE;
  if (!studentCode || !teacherCode || !url || !token) return send(503, { error: 'not_configured' });

  const code = req.headers['x-code'];
  const role = same(code, studentCode) ? 'student' : same(code, teacherCode) ? 'teacher' : null;
  if (!role) { await new Promise(r => setTimeout(r, 400)); return send(401, { error: 'bad_code' }); }

  try {
    if (req.method === 'GET') {
      const raw = await redis(['GET', KEY]);
      return send(200, { role, state: raw ? JSON.parse(raw) : null });
    }
    if (req.method === 'PUT') {
      if (role !== 'student') return send(403, { error: 'read_only' });
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      if (!body || typeof body.json !== 'string' || !Number.isFinite(body.updated) || body.json.length > MAX_BYTES) return send(400, { error: 'bad_body' });
      JSON.parse(body.json);
      const raw = await redis(['GET', KEY]);
      const cur = raw ? JSON.parse(raw) : null;
      if (cur && cur.updated > body.updated) return send(409, { error: 'stale', state: cur });
      await redis(['SET', KEY, JSON.stringify({ updated: body.updated, json: body.json })]);
      return send(200, { ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return send(405, { error: 'method' });
  } catch (e) {
    return send(500, { error: 'server' });
  }
};
