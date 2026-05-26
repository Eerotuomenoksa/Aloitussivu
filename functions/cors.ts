const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://eerotuomenoksa.github.io',
];

export const getAllowedOrigins = () => {
  const configured = process.env.ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGIN ?? '';
  const origins = configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : DEFAULT_ALLOWED_ORIGINS;
};
