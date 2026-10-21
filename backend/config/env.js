require('dotenv').config();

const REQUIRED_VARS = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

function loadConfig() {
    const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(
            `Variables de entorno requeridas ausentes: ${missing.join(', ')}. `
            + 'Copiá backend/.env.example a backend/.env y completá los valores.',
        );
    }

    return {
        port: Number(process.env.PORT) || 3000,
        corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
    };
}

module.exports = loadConfig();