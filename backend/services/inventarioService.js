const { query, withTransaction } = require('../utils/asyncDb');
const { AppError } = require('../utils/errors');

const SLOT_COUNT = 48;

const INVENTARIO_SELECT = `
    SELECT
        i.ranura,
        i.cantidad,
        o.clave as itemKey,
        o.nombre,
        o.descripcion,
        o.categoria,
        o.rareza,
        o.peso,
        o.icono,
        o.consumible,
        o.efectoVida,
        o.maxPila,
        o.tipoEquipamiento,
        o.bonusFuerza,
        o.bonusDestreza,
        o.bonusInteligencia,
        o.bonusConstitucion,
        o.bonusAgilidad
    FROM Inventario i
    LEFT JOIN Objeto o ON i.idObjeto = o.idObjeto
`;

const EQUIPAMIENTO_SELECT = `
    SELECT
        o.tipoEquipamiento as ranura,
        o.clave as itemKey,
        o.nombre,
        o.descripcion,
        o.categoria,
        o.rareza,
        o.peso,
        o.icono,
        o.tipoEquipamiento,
        o.bonusFuerza,
        o.bonusDestreza,
        o.bonusInteligencia,
        o.bonusConstitucion,
        o.bonusAgilidad
    FROM Equipamiento e
    JOIN Objeto o ON e.idObjeto = o.idObjeto
`;

async function getInventario(idPersonaje) {
    return query(`${INVENTARIO_SELECT} WHERE i.idPersonaje = ? ORDER BY i.ranura`, [idPersonaje]);
}

async function getEquipamiento(idPersonaje) {
    return query(`${EQUIPAMIENTO_SELECT} WHERE e.idPersonaje = ?`, [idPersonaje]);
}

async function saveInventario(idPersonaje, items = []) {
    return withTransaction(async (conn) => {
        await conn.query('DELETE FROM Inventario WHERE idPersonaje = ?', [idPersonaje]);

        for (const [ranura, item] of items.entries()) {
            if (!item || !item.itemKey || item.quantity < 1) continue;

            const [objects] = await conn.query('SELECT idObjeto FROM Objeto WHERE clave = ?', [item.itemKey]);
            if (objects.length === 0) continue;

            await conn.query(
                'INSERT INTO Inventario (idPersonaje, ranura, idObjeto, cantidad) VALUES (?, ?, ?, ?)',
                [idPersonaje, ranura, objects[0].idObjeto, item.quantity],
            );
        }

        return { message: 'Inventario guardado' };
    });
}

async function usarObjeto(idPersonaje, ranura) {
    return withTransaction(async (conn) => {
        const [results] = await conn.query(`
            SELECT i.cantidad, o.nombre, o.consumible, o.efectoVida
            FROM Inventario i
            JOIN Objeto o ON i.idObjeto = o.idObjeto
            WHERE i.idPersonaje = ? AND i.ranura = ?
        `, [idPersonaje, ranura]);

        if (results.length === 0) {
            throw new AppError(404, 'Objeto no encontrado');
        }

        const item = results[0];
        if (!item.consumible) {
            throw new AppError(400, 'Este objeto no se puede consumir');
        }

        const nextQuantity = item.cantidad - 1;
        if (nextQuantity > 0) {
            await conn.query(
                'UPDATE Inventario SET cantidad = ? WHERE idPersonaje = ? AND ranura = ?',
                [nextQuantity, idPersonaje, ranura],
            );
        } else {
            await conn.query('DELETE FROM Inventario WHERE idPersonaje = ? AND ranura = ?', [idPersonaje, ranura]);
        }

        return {
            message: `${item.nombre} consumido`,
            effect: { vida: item.efectoVida },
            quantity: nextQuantity,
        };
    });
}

async function equiparObjeto(idPersonaje, ranura) {
    return withTransaction(async (conn) => {
        const [items] = await conn.query(`
            SELECT i.idObjeto, i.cantidad, o.tipoEquipamiento, o.nombre
            FROM Inventario i
            JOIN Objeto o ON i.idObjeto = o.idObjeto
            WHERE i.idPersonaje = ? AND i.ranura = ?
        `, [idPersonaje, ranura]);

        if (items.length === 0) throw new AppError(400, 'Objeto no encontrado');
        const item = items[0];
        if (!item.tipoEquipamiento) throw new AppError(400, 'Este objeto no se puede equipar');
        if (item.cantidad !== 1) throw new AppError(400, 'Los objetos equipables no pueden formar pilas');

        const [occupied] = await conn.query(
            'SELECT idObjeto FROM Equipamiento WHERE idPersonaje = ? AND ranura = ?',
            [idPersonaje, item.tipoEquipamiento],
        );
        if (occupied.length > 0) throw new AppError(400, 'La ranura de equipamiento ya está ocupada');

        await conn.query('DELETE FROM Inventario WHERE idPersonaje = ? AND ranura = ?', [idPersonaje, ranura]);
        await conn.query(
            'INSERT INTO Equipamiento (idPersonaje, ranura, idObjeto) VALUES (?, ?, ?)',
            [idPersonaje, item.tipoEquipamiento, item.idObjeto],
        );

        return { message: `${item.nombre} equipado`, ranura: item.tipoEquipamiento };
    });
}

async function desequiparObjeto(idPersonaje, ranura) {
    return withTransaction(async (conn) => {
        const [equipment] = await conn.query(`
            SELECT e.idObjeto, o.clave, o.nombre
            FROM Equipamiento e
            JOIN Objeto o ON e.idObjeto = o.idObjeto
            WHERE e.idPersonaje = ? AND e.ranura = ?
        `, [idPersonaje, ranura]);

        if (equipment.length === 0) {
            throw new AppError(400, 'Ranura de equipamiento vacía');
        }

        const [emptySlots] = await conn.query(
            'SELECT ranura FROM Inventario WHERE idPersonaje = ? ORDER BY ranura',
            [idPersonaje],
        );
        const usedSlots = new Set(emptySlots.map((slot) => slot.ranura));
        let targetSlot = 0;
        while (usedSlots.has(targetSlot)) targetSlot += 1;

        await conn.query('DELETE FROM Equipamiento WHERE idPersonaje = ? AND ranura = ?', [idPersonaje, ranura]);
        await conn.query(
            'INSERT INTO Inventario (idPersonaje, ranura, idObjeto, cantidad) VALUES (?, ?, ?, 1)',
            [idPersonaje, targetSlot, equipment[0].idObjeto],
        );

        return { message: `${equipment[0].nombre} desequipado`, ranura: targetSlot };
    });
}

async function transferirObjeto(idPersonaje, ranura, destinoIdPersonaje) {
    return withTransaction(async (conn) => {
        const sourceId = Number(idPersonaje);
        const targetId = Number(destinoIdPersonaje);
        const slot = Number(ranura);

        if (!Number.isInteger(sourceId) || !Number.isInteger(targetId) || !Number.isInteger(slot)) {
            throw new AppError(400, 'Datos de transferencia inválidos');
        }
        if (targetId === sourceId) {
            throw new AppError(400, 'No puedes transferir un objeto al mismo personaje');
        }

        const [validTarget] = await conn.query('SELECT idPersonaje FROM Personaje WHERE idPersonaje = ?', [targetId]);
        if (validTarget.length === 0) {
            throw new AppError(404, 'El personaje de destino no existe');
        }

        const [sourceRows] = await conn.query(`
            SELECT i.idObjeto, i.cantidad, o.nombre, o.maxPila
            FROM Inventario i
            JOIN Objeto o ON i.idObjeto = o.idObjeto
            WHERE i.idPersonaje = ? AND i.ranura = ?
        `, [sourceId, slot]);
        if (sourceRows.length === 0) {
            throw new AppError(404, 'Objeto no encontrado');
        }

        const item = sourceRows[0];
        let remaining = item.cantidad;

        const [destPiles] = await conn.query(
            'SELECT ranura, cantidad FROM Inventario WHERE idPersonaje = ? AND idObjeto = ? ORDER BY ranura',
            [targetId, item.idObjeto],
        );
        for (const pile of destPiles) {
            if (remaining <= 0) break;
            const room = item.maxPila - pile.cantidad;
            const take = Math.min(room, remaining);
            if (take > 0) {
                await conn.query(
                    'UPDATE Inventario SET cantidad = cantidad + ? WHERE idPersonaje = ? AND ranura = ?',
                    [take, targetId, pile.ranura],
                );
                remaining -= take;
            }
        }

        if (remaining > 0) {
            const [usedRows] = await conn.query(
                'SELECT ranura FROM Inventario WHERE idPersonaje = ? ORDER BY ranura',
                [targetId],
            );
            const usedSlots = new Set(usedRows.map((row) => row.ranura));
            let targetSlot = 0;
            while (usedSlots.has(targetSlot)) targetSlot += 1;
            if (targetSlot >= SLOT_COUNT) {
                throw new AppError(400, 'El personaje de destino no tiene espacio');
            }
            await conn.query(
                'INSERT INTO Inventario (idPersonaje, ranura, idObjeto, cantidad) VALUES (?, ?, ?, ?)',
                [targetId, targetSlot, item.idObjeto, remaining],
            );
        }

        await conn.query('DELETE FROM Inventario WHERE idPersonaje = ? AND ranura = ?', [sourceId, slot]);

        return { message: `${item.nombre} transferido`, cantidad: item.cantidad };
    });
}

async function desequiparObjetoEnRanura(idPersonaje, ranura, ranuraDestino) {
    return withTransaction(async (conn) => {
        const targetSlot = Number(ranuraDestino);
        if (!Number.isInteger(targetSlot) || targetSlot < 0 || targetSlot >= SLOT_COUNT) {
            throw new AppError(400, 'La ranura de destino no es válida');
        }

        const [equipment] = await conn.query(`
            SELECT e.idObjeto, o.clave, o.nombre
            FROM Equipamiento e
            JOIN Objeto o ON e.idObjeto = o.idObjeto
            WHERE e.idPersonaje = ? AND e.ranura = ?
        `, [idPersonaje, ranura]);
        if (equipment.length === 0) {
            throw new AppError(400, 'Ranura de equipamiento vacía');
        }

        const [occupied] = await conn.query(
            'SELECT ranura FROM Inventario WHERE idPersonaje = ? AND ranura = ?',
            [idPersonaje, targetSlot],
        );
        if (occupied.length > 0) {
            throw new AppError(400, 'Ese espacio de la mochila está ocupado');
        }

        await conn.query('DELETE FROM Equipamiento WHERE idPersonaje = ? AND ranura = ?', [idPersonaje, ranura]);
        await conn.query(
            'INSERT INTO Inventario (idPersonaje, ranura, idObjeto, cantidad) VALUES (?, ?, ?, 1)',
            [idPersonaje, targetSlot, equipment[0].idObjeto],
        );

        return { message: `${equipment[0].nombre} desequipado`, ranura: targetSlot };
    });
}

module.exports = {
    getInventario,
    getEquipamiento,
    saveInventario,
    usarObjeto,
    equiparObjeto,
    desequiparObjeto,
    desequiparObjetoEnRanura,
    transferirObjeto,
};