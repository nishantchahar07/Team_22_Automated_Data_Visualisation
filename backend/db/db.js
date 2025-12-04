const mongoose = require('mongoose');

let connectionPromise = null;

function buildMongoUriFromEnv() {
  const host = process.env.MONGO_HOST || 'localhost:27017';
  const db = process.env.MONGO_DB || 'autodash';
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS;
  const looksLikeSrv = /\.mongodb\.net(:\d+)?$/.test(host);
  const useSrv = (process.env.MONGO_SRV || '').toLowerCase() === 'false' ? false : looksLikeSrv;
  const scheme = useSrv ? 'mongodb+srv' : 'mongodb';
  const tls = (process.env.MONGO_TLS || (useSrv ? 'true' : 'false')).toLowerCase() === 'true';
  const authSource = process.env.MONGO_AUTH_SOURCE;
  const mechanism = process.env.MONGO_MECHANISM;
  const params = new URLSearchParams(process.env.MONGO_PARAMS || '');

  if (tls) params.set('tls', 'true');
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');
  if (!params.has('w')) params.set('w', 'majority');
  if (authSource) params.set('authSource', authSource);
  else if (looksLikeSrv && (process.env.MONGO_USER || process.env.MONGO_PASS)) params.set('authSource', 'admin');
  if (mechanism) params.set('authMechanism', mechanism);

  let auth = '';
  if (user) {
    const encUser = encodeURIComponent(user);
    const encPass = pass != null ? encodeURIComponent(pass) : '';
    auth = encPass ? `${encUser}:${encPass}@` : `${encUser}@`;
  }

  return `${scheme}://${auth}${host}/${db}?${params.toString()}`;
}

function normalizeMongoUri(uri) {
  const trimmed = uri.trim();
  if (/^mongodb\+srv:\/\//.test(trimmed) && !/[?&]authSource=/.test(trimmed)) {
    return `${trimmed}${trimmed.includes('?') ? '&' : '?'}authSource=admin`;
  }
  return trimmed;
}

function getMongoUri() {
  if (process.env.MONGO_URI && process.env.MONGO_URI.trim()) return normalizeMongoUri(process.env.MONGO_URI);
  return buildMongoUriFromEnv();
}

function connectMongo() {
  if (connectionPromise) return connectionPromise;
  const { MONGO_DEBUG = 'false' } = process.env;
  mongoose.set('strictQuery', true);
  mongoose.set('debug', MONGO_DEBUG === 'true');

  const uri = getMongoUri();

  connectionPromise = mongoose.connect(uri, {
    autoIndex: true,
    maxPoolSize: 10,
  }).catch((err) => {
    const safeUri = uri.replace(/:\\?[^@/]+@/, ':***@');
    const hint = [
      'Mongo connection failed.',
      `URI: ${safeUri}`,
      'Tips:',
      '- Verify username/password (case-sensitive) and user has access to the database (MONGO_DB).',
      '- If your password has special characters, use MONGO_USER/MONGO_PASS instead of embedding in MONGO_URI.',
      '- For Atlas, ensure your IP is allowlisted or use VPN. Enable SRV/TLS for *.mongodb.net hosts.',
      '- If using username/password auth, try setting MONGO_AUTH_SOURCE=admin.'
    ].join('\n');
    err.message = `${err.message}\n${hint}`;
    throw err;
  });
  return connectionPromise;
}

module.exports = { connectMongo };
