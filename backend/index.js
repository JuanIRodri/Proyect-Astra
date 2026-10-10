const env = require('./config/env');
const crypto = require('node:crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const personajesRoutes = require('./routes/personajesRoutes');
const partidasRoutes = require('./routes/partidasRoutes');

const app = express();

// Seguridad y trazabilidad
app.use(helmet());
app.use((req, res, next) => {
    req.id = crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
});
morgan.token('reqId', (req) => req.id);
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(':reqId :method :url :status :response-time ms'));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes, intentá más tarde.' },
});

// Middlewares
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', limiter);

// Routes
app.use('/api/personajes', personajesRoutes);
app.use('/api/partidas', partidasRoutes);

// 404 para rutas no declaradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo central de errores (último recurso, para lo que no ataja asyncHandler)
app.use((err, req, res, next) => {
    const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
});