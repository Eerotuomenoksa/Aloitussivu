const requiredEnvNames = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

const missing = requiredEnvNames.filter((name) => !process.env[name]?.trim());
if (missing.length > 0) {
  console.error(`Missing Firebase environment variables: ${missing.join(', ')}`);
  process.exitCode = 1;
  throw new Error('Firebase environment validation failed.');
}

const apiKey = process.env.VITE_FIREBASE_API_KEY.trim();

try {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
  const payload = await response.json().catch(() => ({}));
  const message = payload?.error?.message;

  if (message === 'MISSING_ID_TOKEN') {
    console.log('Firebase API key accepted by Identity Toolkit.');
  } else {
    console.error(`Firebase API key validation failed: ${message || response.status}`);
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`Firebase API key validation request failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
