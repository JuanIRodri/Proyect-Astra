require('dotenv').config();
const express = require('express');
const cors = require('cors');
const personajesRoutes = require('./routes/personajesRoutes');
const partidasRoutes = require('./routes/partidasRoutes');

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Middlewares
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});