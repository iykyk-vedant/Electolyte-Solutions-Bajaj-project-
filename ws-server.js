/**
 * Standalone WebSocket server for real-time SR No synchronization.
 * Runs on port 3002 (WS) alongside the Next.js server.
 *
 * Two responsibilities:
 *  1. Accept WebSocket connections from browser clients and push SR No updates.
 *  2. Expose an HTTP POST /broadcast endpoint that the Next.js server action
 *     calls after saving a tag entry, triggering a broadcast to all clients.
 */

const http = require('http');
const { WebSocketServer } = require('ws');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// ── PostgreSQL connection (mirrors pg-db.ts config) ──────────────────────────
const poolConfig = {
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

if (process.env.DATABASE_URL) {
  Object.assign(poolConfig, {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL_DISABLED === 'true' ? false : { rejectUnauthorized: false },
  });
} else {
  Object.assign(poolConfig, {
    host: (process.env.PG_HOST || 'localhost').replace(/'/g, ''),
    port: parseInt(process.env.PG_PORT || '5432'),
    user: (process.env.PG_USER || 'postgres').replace(/'/g, ''),
    password: (process.env.PG_PASSWORD || '').replace(/'/g, ''),
    database: (process.env.PG_DATABASE || 'nexscan').replace(/'/g, ''),
    ssl: process.env.DB_SSL_DISABLED === 'true' ? false : { rejectUnauthorized: false },
  });
}

const pool = new Pool(poolConfig);

// ── Fetch next SR No from DB ─────────────────────────────────────────────────
async function getNextSrNo() {
  try {
    const result = await pool.query(`
      SELECT MAX(CAST(sr_no AS INTEGER)) AS max_sr_no
      FROM consolidated_data
      WHERE sr_no ~ '^[0-9]+$'
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
    `);
    const maxSrNo = result.rows[0]?.max_sr_no ?? 0;
    return String((maxSrNo ?? 0) + 1).padStart(4, '0');
  } catch (err) {
    console.error('[WS] Error fetching next SR No:', err.message);
    return '0001';
  }
}

// ── Broadcast to all connected clients ───────────────────────────────────────
function broadcastSrNo(wss, nextSrNo) {
  const message = JSON.stringify({ type: 'sr_no_update', nextSrNo });
  let count = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === 1 /* WebSocket.OPEN */) {
      client.send(message);
      count++;
    }
  });
  console.log(`[WS] Broadcasted nextSrNo=${nextSrNo} to ${count} client(s)`);
}

// ── HTTP + WebSocket server ──────────────────────────────────────────────────
const WS_PORT = parseInt(process.env.WS_PORT || '3002');

const server = http.createServer(async (req, res) => {
  // CORS headers for Next.js server action calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /broadcast — called by Next.js after a save
  if (req.method === 'POST' && req.url === '/broadcast') {
    try {
      const nextSrNo = await getNextSrNo();
      broadcastSrNo(wss, nextSrNo);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, nextSrNo }));
    } catch (err) {
      console.error('[WS] Broadcast error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    const nextSrNo = await getNextSrNo();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', connections: wss.clients.size, nextSrNo }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const wss = new WebSocketServer({ server });

wss.on('connection', async (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[WS] Client connected from ${clientIp} (total: ${wss.clients.size})`);

  // Send current next SR No immediately on connect
  try {
    const nextSrNo = await getNextSrNo();
    ws.send(JSON.stringify({ type: 'sr_no_update', nextSrNo }));
  } catch (err) {
    console.error('[WS] Error sending initial SR No:', err.message);
  }

  ws.on('close', () => {
    console.log(`[WS] Client disconnected (remaining: ${wss.clients.size})`);
  });

  ws.on('error', (err) => {
    console.error('[WS] Client error:', err.message);
  });
});

server.listen(WS_PORT, '0.0.0.0', () => {
  console.log(`[WS] SR No WebSocket server listening on ws://0.0.0.0:${WS_PORT}`);
  console.log(`[WS] Broadcast endpoint: http://localhost:${WS_PORT}/broadcast`);
  console.log(`[WS] Health check: http://localhost:${WS_PORT}/health`);
});
