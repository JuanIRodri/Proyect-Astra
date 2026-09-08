const { query, withTransaction } = require('../utils/asyncDb');
const { AppError } = require('../utils/errors');

const DEFAULT_LIDER_X = 5;
const DEFAULT_LIDER_Y = 4;

async function list() {
    const rows = await query(`
        SELECT idPartida, nombre, mapa, liderX, liderY, liderIndex, fechaGuardado
        FROM Partida
        ORDER BY idPartida
    `);
    return rows.map((row) => ({
        ...row,
        tieneGuardado: row.fechaGuardado !== null,
    }));
}

async function detail(id) {
    const rows = await query(`
        SELECT idPartida, nombre, mapa, liderX, liderY, liderIndex, fechaGuardado
        FROM Partida
        WHERE idPartida = ?
    `, [id]);
    if (rows.length === 0) {
        throw new AppError(404, 'Partida no encontrada');
    }
    return { ...rows[0], tieneGuardado: rows[0].fechaGuardado !== null };
}

async function save(id, data = {}) {
    const existe = await detail(id);
    const {
        mapa = existe.mapa,
        liderX = existe.liderX ?? DEFAULT_LIDER_X,
        liderY = existe.liderY ?? DEFAULT_LIDER_Y,
        liderIndex = existe.liderIndex ?? 0,
    } = data;

    const result = await query(`
        UPDATE Partida
        SET mapa = ?, liderX = ?, liderY = ?, liderIndex = ?, fechaGuardado = NOW()
        WHERE idPartida = ?
    `, [mapa, liderX, liderY, liderIndex, id]);
    if (result.affectedRows === 0) {
        throw new AppError(404, 'Partida no encontrada');
    }
    return detail(id);
}

async function reset(id) {
    await detail(id);
    const result = await query(`
        UPDATE Partida
        SET mapa = NULL, liderX = NULL, liderY = NULL, liderIndex = 0, fechaGuardado = NULL
        WHERE idPartida = ?
    `, [id]);
    if (result.affectedRows === 0) {
        throw new AppError(404, 'Partida no encontrada');
    }
    return detail(id);
}

module.exports = { list, detail, save, reset };