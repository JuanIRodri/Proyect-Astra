const db = require('../config/db');

exports.getPersonajes = (req, res) => {
    const query = `
        SELECT 
            p.idPersonaje, p.nombre, p.clase, p.nivel, p.altura, p.musculatura,
            c.Forma as Cabeza_Forma,
            ca.Corte as Cabello_Corte, ca.Tinte as Cabello_Tinte,
            o.Color as Ojos_Color, o.Forma as Ojos_Forma,
            b.Forma as Boca_Forma,
            n.Forma as Nariz_Forma,
            cn.Cantidad as Cuernos_Cantidad, cn.Tamanio as Cuernos_Tamanio, cn.Color as Cuernos_Color,
            t.Forma as Torso_Forma, t.Bello as Torso_Bello,
            e.fuerza, e.destreza, e.inteligencia, e.constitucion, e.agilidad
        FROM Personaje p
        JOIN Cuerpo cp ON p.idCuerpo = cp.idCuerpo
        JOIN Cabeza c ON cp.idCabeza = c.idCabeza
        JOIN Cabello ca ON c.idCabello = ca.idCabello
        JOIN Ojos o ON c.idOjos = o.idOjos
        JOIN Boca b ON c.idBoca = b.idBoca
        JOIN Nariz n ON c.idNariz = n.idNariz
        JOIN Cuernos cn ON c.idCuernos = cn.idCuernos
        JOIN Torso t ON cp.idTorso = t.idTorso
        LEFT JOIN Estadistica e ON p.idPersonaje = e.idPersonaje;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching characters:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
};

exports.getPersonajeDetail = (req, res) => {
    const query = `
        SELECT 
            p.idPersonaje, p.nombre, p.clase, p.nivel, p.altura, p.musculatura,
            c.Forma as Cabeza_Forma,
            ca.Corte as Cabello_Corte, ca.Tinte as Cabello_Tinte,
            b.Forma as Boca_Forma, b.Tamanio as Boca_Tamanio, b.Color as Boca_Color,
            n.Forma as Nariz_Forma, n.Tamanio as Nariz_Tamanio,
            cu.Cantidad as Cuernos_Cantidad, cu.Tamanio as Cuernos_Tamanio, cu.Color as Cuernos_Color,
            o.Color as Ojos_Color, o.Forma as Ojos_Forma, o.Tamanio as Ojos_Tamanio,
            ce.Tinte as Cejas_Tinte, ce.Forma as Cejas_Forma,
            pe.Forma as Pestanias_Forma, pe.Tamanio as Pestanias_Tamanio,
            t.Forma as Torso_Forma, t.Tamanio as Torso_Tamanio, t.Bello as Torso_Bello,
            br_f.Tipo as Brazo_Tipo, br_f.color as Brazo_Color, br.Cantidad as Brazo_Cantidad,
            pi.Tipo as Pierna_Tipo, pi.Tamanio as Pierna_Tamanio,
            e.fuerza, e.destreza, e.inteligencia, e.constitucion, e.agilidad
        FROM Personaje p
        JOIN Cuerpo cr ON p.idCuerpo = cr.idCuerpo
        JOIN Cabeza c ON cr.idCabeza = c.idCabeza
        JOIN Cabello ca ON c.idCabello = ca.idCabello
        JOIN Boca b ON c.idBoca = b.idBoca
        JOIN Nariz n ON c.idNariz = n.idNariz
        JOIN Cuernos cu ON c.idCuernos = cu.idCuernos
        JOIN Ojos o ON c.idOjos = o.idOjos
        JOIN Cejas ce ON o.idCejas = ce.idCejas
        JOIN Pestanias pe ON o.idPestanias = pe.idPestanias
        JOIN Torso t ON cr.idTorso = t.idTorso
        JOIN Brazo br ON cr.idBrazo = br.idBrazo
        JOIN FormaBrazo br_f ON br.idFormaBrazo = br_f.idFormaBrazo
        JOIN Pierna pi ON cr.idPierna = pi.idPierna
        LEFT JOIN Estadistica e ON p.idPersonaje = e.idPersonaje
        WHERE p.idPersonaje = ?;
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching character detail:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Personaje no encontrado' });
            return;
        }
        res.json(results[0]);
    });
};

exports.deletePersonaje = (req, res) => {
    const query = 'DELETE FROM Personaje WHERE idPersonaje = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'Personaje eliminado' });
    });
};

exports.updatePersonaje = (req, res) => {
    const { 
        nombre, clase, altura, musculatura, 
        fuerza, destreza, inteligencia, constitucion, agilidad,
        cabello_corte, cabello_tinte, ojos_color, ojos_forma,
        boca_forma, cabeza_forma, nariz_forma, torso_forma,
        cuernos_cantidad, cuernos_tamanio, cuernos_color, torso_bello
    } = req.body;

    const id = req.params.id;

    // 1. Actualizar Datos Básicos del Personaje
    const query = `
        UPDATE Personaje 
        SET nombre = ?, clase = ?, altura = ?, musculatura = ? 
        WHERE idPersonaje = ?
    `;
    db.query(query, [nombre, clase, altura, musculatura, id], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error updating character basics' });
            return;
        }
        
        // 2. Actualizar Estadísticas
        const statsQuery = `
            INSERT INTO Estadistica (idPersonaje, fuerza, destreza, inteligencia, constitucion, agilidad)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              fuerza = VALUES(fuerza),
              destreza = VALUES(destreza),
              inteligencia = VALUES(inteligencia),
              constitucion = VALUES(constitucion),
              agilidad = VALUES(agilidad)
        `;
        db.query(statsQuery, [id, fuerza, destreza, inteligencia, constitucion, agilidad], (statsErr) => {
            if (statsErr) {
                console.error(statsErr);
                res.status(500).json({ error: 'Error updating statistics' });
                return;
            }

            // 3. Actualizar Todas las Partes Físicas (Usando JOINs)
            // MySQL permite JOINs en UPDATEs
            const physicalQuery = `
                UPDATE Personaje p
                JOIN Cuerpo cp ON p.idCuerpo = cp.idCuerpo
                JOIN Cabeza cb ON cp.idCabeza = cb.idCabeza
                JOIN Cabello ca ON cb.idCabello = ca.idCabello
                JOIN Boca b ON cb.idBoca = b.idBoca
                JOIN Ojos o ON cb.idOjos = o.idOjos
                JOIN Nariz n ON cb.idNariz = n.idNariz
                JOIN Cuernos cu ON cb.idCuernos = cu.idCuernos
                JOIN Torso t ON cp.idTorso = t.idTorso
                SET 
                    ca.Corte = ?, ca.Tinte = ?,
                    b.Forma = ?,
                    o.Color = ?, o.Forma = ?,
                    n.Forma = ?,
                    cu.Cantidad = ?, cu.Tamanio = ?, cu.Color = ?,
                    t.Forma = ?, t.Bello = ?,
                    cb.Forma = ?
                WHERE p.idPersonaje = ?
            `;

            db.query(physicalQuery, [
                cabello_corte, cabello_tinte,
                boca_forma,
                ojos_color, ojos_forma,
                nariz_forma,
                cuernos_cantidad, cuernos_tamanio, cuernos_color,
                torso_forma, torso_bello,
                cabeza_forma,
                id
            ], (physErr) => {
                if (physErr) {
                    console.error(physErr);
                    res.status(500).json({ error: 'Error updating physical attributes' });
                    return;
                }
                res.json({ message: 'Personaje y apariencia actualizados con éxito' });
            });
        });
    });
};

exports.createPersonaje = async (req, res) => {
    const { 
        nombre, clase, nivel, altura, musculatura, 
        fuerza = 10, destreza = 10, inteligencia = 10, constitucion = 10, agilidad = 10,
        cabello_corte = 'Corto', cabello_tinte = 'Castaño', ojos_color = 'Marrón', 
        ojos_forma = 'Almendrados', boca_forma = 'Común', cabeza_forma = 'Ovalada',
        nariz_forma = 'Recta', torso_forma = 'Atlético', cuernos_cantidad = 0, 
        cuernos_tamanio = 'N/A', cuernos_color = 'N/A', torso_bello = 0
    } = req.body;

    try {
        const executeQuery = (sql, params) => {
            return new Promise((resolve, reject) => {
                db.query(sql, params, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        };

        // 1. Partes Básicas con datos del usuario
        const boca = await executeQuery('INSERT INTO Boca (Forma, Tamanio, Color) VALUES (?, "Medio", "Rojo")', [boca_forma]);
        const cabello = await executeQuery('INSERT INTO Cabello (Corte, Tinte) VALUES (?, ?)', [cabello_corte, cabello_tinte]);
        const nariz = await executeQuery('INSERT INTO Nariz (Forma, Tamanio) VALUES (?, "Medio")', [nariz_forma]);
        const cuernos = await executeQuery('INSERT INTO Cuernos (Cantidad, Tamanio, Color) VALUES (?, ?, ?)', [cuernos_cantidad, cuernos_tamanio, cuernos_color]);
        const cejas = await executeQuery('INSERT INTO Cejas (Tinte, Forma) VALUES ("Castaño", "Arqueadas")');
        const pestanias = await executeQuery('INSERT INTO Pestanias (Forma, Tamanio) VALUES ("Normal", "Medio")');
        
        // 2. Ojos con color y forma del usuario
        const ojos = await executeQuery(
            'INSERT INTO Ojos (idPestanias, idCejas, Color, Forma, Tamanio) VALUES (?, ?, ?, ?, "Medio")',
            [pestanias.insertId, cejas.insertId, ojos_color, ojos_forma]
        );

        // 3. Cabeza con forma del usuario
        const cabeza = await executeQuery(
            'INSERT INTO Cabeza (idOJos, idCabello, idBoca, idNariz, idCuernos, Forma) VALUES (?, ?, ?, ?, ?, ?)',
            [ojos.insertId, cabello.insertId, boca.insertId, nariz.insertId, cuernos.insertId, cabeza_forma]
        );

        // 4. Cuerpo con forma y vello del usuario
        const formaBrazo = await executeQuery('INSERT INTO FormaBrazo (Tamanio, Tipo, color) VALUES (70, "Humano", "Piel")');
        const brazo = await executeQuery('INSERT INTO Brazo (Cantidad, idFormaBrazo) VALUES (2, ?)', [formaBrazo.insertId]);
        const pierna = await executeQuery('INSERT INTO Pierna (Tamanio, Tipo) VALUES (90, "Humano")');
        const torso = await executeQuery('INSERT INTO Torso (Forma, Tamanio, Bello) VALUES (?, "Medio", ?)', [torso_forma, torso_bello]);

        // 5. Cuerpo Completo
        const cuerpo = await executeQuery(
            'INSERT INTO Cuerpo (idBrazo, idPierna, idTorso, idCabeza) VALUES (?, ?, ?, ?)',
            [brazo.insertId, pierna.insertId, torso.insertId, cabeza.insertId]
        );

        // 6. Personaje
        const personaje = await executeQuery(
            'INSERT INTO Personaje (nombre, clase, nivel, altura, musculatura, idCuerpo) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, clase, nivel, altura, musculatura, cuerpo.insertId]
        );

        // 7. Estadísticas
        await executeQuery(
            'INSERT INTO Estadistica (idPersonaje, fuerza, destreza, inteligencia, constitucion, agilidad) VALUES (?, ?, ?, ?, ?, ?)',
            [personaje.insertId, fuerza, destreza, inteligencia, constitucion, agilidad]
        );

        res.status(201).json({ id: personaje.insertId, message: 'Personaje creado con estructura completa y personalizada' });

    } catch (error) {
        console.error('Error creating character:', error);
        res.status(500).json({ error: 'Error al crear el personaje y su estructura' });
    }
};

exports.getInventario = (req, res) => {
    const query = `
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
        WHERE i.idPersonaje = ?
        ORDER BY i.ranura
    `;

    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
};

exports.getEquipamiento = (req, res) => {
    const query = `
        SELECT
            e.ranura,
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
        WHERE e.idPersonaje = ?
    `;

    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching equipment:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
};

exports.equiparObjeto = async (req, res) => {
    const { id, ranura } = req.params;
    const connection = db.promise();

    try {
        const [items] = await connection.query(`
            SELECT i.idObjeto, i.cantidad, o.tipoEquipamiento, o.nombre
            FROM Inventario i
            JOIN Objeto o ON i.idObjeto = o.idObjeto
            WHERE i.idPersonaje = ? AND i.ranura = ?
        `, [id, ranura]);

        if (items.length === 0) throw new Error('Objeto no encontrado');
        const item = items[0];
        if (!item.tipoEquipamiento) throw new Error('Este objeto no se puede equipar');
        if (item.cantidad !== 1) throw new Error('Los objetos equipables no pueden formar pilas');

        const [occupied] = await connection.query(
            'SELECT idObjeto FROM Equipamiento WHERE idPersonaje = ? AND ranura = ?',
            [id, item.tipoEquipamiento],
        );
        if (occupied.length > 0) throw new Error('La ranura de equipamiento ya está ocupada');

        await connection.beginTransaction();
        await connection.query('DELETE FROM Inventario WHERE idPersonaje = ? AND ranura = ?', [id, ranura]);
        await connection.query(
            'INSERT INTO Equipamiento (idPersonaje, ranura, idObjeto) VALUES (?, ?, ?)',
            [id, item.tipoEquipamiento, item.idObjeto],
        );
        await connection.commit();
        res.json({ message: `${item.nombre} equipado`, ranura: item.tipoEquipamiento });
    } catch (err) {
        try { await connection.rollback(); } catch {}
        const status = ['Objeto no encontrado', 'Este objeto no se puede equipar', 'Los objetos equipables no pueden formar pilas', 'La ranura de equipamiento ya está ocupada'].includes(err.message) ? 400 : 500;
        if (status === 500) console.error('Error equipping item:', err);
        res.status(status).json({ error: err.message || 'Database error' });
    }
};

exports.desequiparObjeto = async (req, res) => {
    const { id, ranura } = req.params;
    const connection = db.promise();

    try {
        const [equipment] = await connection.query(`
            SELECT e.idObjeto, o.clave, o.nombre
            FROM Equipamiento e
            JOIN Objeto o ON e.idObjeto = o.idObjeto
            WHERE e.idPersonaje = ? AND e.ranura = ?
        `, [id, ranura]);
        if (equipment.length === 0) throw new Error('Ranura de equipamiento vacía');

        const [emptySlots] = await connection.query(
            'SELECT ranura FROM Inventario WHERE idPersonaje = ? ORDER BY ranura',
            [id],
        );
        const usedSlots = new Set(emptySlots.map((slot) => slot.ranura));
        let targetSlot = 0;
        while (usedSlots.has(targetSlot)) targetSlot += 1;

        await connection.beginTransaction();
        await connection.query('DELETE FROM Equipamiento WHERE idPersonaje = ? AND ranura = ?', [id, ranura]);
        await connection.query(
            'INSERT INTO Inventario (idPersonaje, ranura, idObjeto, cantidad) VALUES (?, ?, ?, 1)',
            [id, targetSlot, equipment[0].idObjeto],
        );
        await connection.commit();
        res.json({ message: `${equipment[0].nombre} desequipado`, ranura: targetSlot });
    } catch (err) {
        try { await connection.rollback(); } catch {}
        const status = err.message === 'Ranura de equipamiento vacía' ? 400 : 500;
        if (status === 500) console.error('Error unequipping item:', err);
        res.status(status).json({ error: err.message || 'Database error' });
    }
};

exports.saveInventario = async (req, res) => {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const idPersonaje = req.params.id;
    const connection = db.promise();

    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM Inventario WHERE idPersonaje = ?', [idPersonaje]);

        for (const [ranura, item] of items.entries()) {
            if (!item || !item.itemKey || item.quantity < 1) continue;
            const [objects] = await connection.query('SELECT idObjeto FROM Objeto WHERE clave = ?', [item.itemKey]);
            if (objects.length === 0) continue;
            await connection.query(
                'INSERT INTO Inventario (idPersonaje, ranura, idObjeto, cantidad) VALUES (?, ?, ?, ?)',
                [idPersonaje, ranura, objects[0].idObjeto, item.quantity],
            );
        }

        await connection.commit();
        res.json({ message: 'Inventario guardado' });
    } catch (err) {
        await connection.rollback();
        console.error('Error saving inventory:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.useInventarioObjeto = (req, res) => {
    const { id, ranura } = req.params;
    const selectQuery = `
        SELECT i.cantidad, o.nombre, o.consumible, o.efectoVida
        FROM Inventario i
        JOIN Objeto o ON i.idObjeto = o.idObjeto
        WHERE i.idPersonaje = ? AND i.ranura = ?
    `;

    db.query(selectQuery, [id, ranura], (err, results) => {
        if (err) {
            console.error('Error reading inventory item:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Objeto no encontrado' });
            return;
        }
        const item = results[0];
        if (!item.consumible) {
            res.status(400).json({ error: 'Este objeto no se puede consumir' });
            return;
        }

        const nextQuantity = item.cantidad - 1;
        const updateQuery = nextQuantity > 0
            ? 'UPDATE Inventario SET cantidad = ? WHERE idPersonaje = ? AND ranura = ?'
            : 'DELETE FROM Inventario WHERE idPersonaje = ? AND ranura = ?';
        const updateParams = nextQuantity > 0
            ? [nextQuantity, id, ranura]
            : [id, ranura];

        db.query(updateQuery, updateParams, (updateErr) => {
            if (updateErr) {
                console.error('Error consuming inventory item:', updateErr);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            res.json({
                message: `${item.nombre} consumido`,
                effect: { vida: item.efectoVida },
                quantity: nextQuantity,
            });
        });
    });
};
