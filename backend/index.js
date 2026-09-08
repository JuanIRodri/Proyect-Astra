require('dotenv').config();
const express = require('express');
const cors = require('cors');
const personajesRoutes = require('./routes/personajesRoutes');
const partidasRoutes = require('./routes/partidasRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/personajes', personajesRoutes);
app.use('/api/partidas', partidasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
