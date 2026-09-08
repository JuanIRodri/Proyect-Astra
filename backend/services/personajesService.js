const { query, withTransaction } = require('../utils/asyncDb');
const { AppError } = require('../utils/errors');

const PERSONAJE_BASE_FROM = `
    FROM Personaje p
    JOIN Cuerpo cp ON p.idCuerpo = cp.idCuerpo
    JOIN Cabeza c ON cp.idCabeza = c.idCabeza
    JOIN Cabello ca ON c.idCabello = ca.idCabello
    JOIN Ojos o ON c.idOjos = o.idOjos
    JOIN Boca b ON c.idBoca = b.idBoca
    JOIN Nariz n ON c.idNariz = n.idNariz
    JOIN Cuernos cn ON c.idCuernos = cn.idCuernos
    JOIN Torso t ON cp.idTorso = t.idTorso
`;

async function list() {
    return query(`
        SELECT
            p.idPersonaje, p.nombre, p.clase, p.nivel, p.altura, p.musculatura,
            c.Forma as Cabeza_Forma,
            ca.Corte as Cabello_Corte, ca.Tinte as Cabello_Tinte,
            o.Color as Ojos_Color, o.Forma as Ojos_Forma,
            b.Forma as Boca_Forma,
            n.Forma as Nariz_Forma,
            cn.Cantidad as Cuernos_Cantidad, cn.Tamanio as Cuernos_Tamanio, cn.Color as Cuernos_Color,
            t.Forma as Torso_Forma, t.Bello as Torso_Bello,
            e.fuerza, e.destreza, e.inteligencia, e.constitucion, e.agilidad,
            e.vidaActual, e.manaActual,
            (30 + e.constitucion * 5) AS vidaMax,
            (20 + e.inteligencia * 5) AS manaMax
        ${PERSONAJE_BASE_FROM}
        LEFT JOIN Estadistica e ON p.idPersonaje = e.idPersonaje;
    `);
}

async function detail(id) {
    const rows = await query(`
        SELECT
            p.idPersonaje, p.nombre, p.clase, p.nivel, p.altura, p.musculatura,
            c.Forma as Cabeza_Forma,
            ca.Corte as Cabello_Corte, ca.Tinte as Cabello_Tinte,
            b.Forma as Boca_Forma, b.Tamanio as Boca_Tamanio, b.Color as Boca_Color,
            n.Forma as Nariz_Forma, n.Tamanio as Nariz_Tamanio,
            cn.Cantidad as Cuernos_Cantidad, cn.Tamanio as Cuernos_Tamanio, cn.Color as Cuernos_Color,
            o.Color as Ojos_Color, o.Forma as Ojos_Forma, o.Tamanio as Ojos_Tamanio,
            ce.Tinte as Cejas_Tinte, ce.Forma as Cejas_Forma,
            pe.Forma as Pestanias_Forma, pe.Tamanio as Pestanias_Tamanio,
            t.Forma as Torso_Forma, t.Tamanio as Torso_Tamanio, t.Bello as Torso_Bello,
            br_f.Tipo as Brazo_Tipo, br_f.color as Brazo_Color, br.Cantidad as Brazo_Cantidad,
            pi.Tipo as Pierna_Tipo, pi.Tamanio as Pierna_Tamanio,
            e.fuerza, e.destreza, e.inteligencia, e.constitucion, e.agilidad,
            e.vidaActual, e.manaActual,
            (30 + e.constitucion * 5) AS vidaMax,
            (20 + e.inteligencia * 5) AS manaMax
        ${PERSONAJE_BASE_FROM}
        JOIN Cejas ce ON o.idCejas = ce.idCejas
        JOIN Pestanias pe ON o.idPestanias = pe.idPestanias
        JOIN Brazo br ON cp.idBrazo = br.idBrazo
        JOIN FormaBrazo br_f ON br.idFormaBrazo = br_f.idFormaBrazo
        JOIN Pierna pi ON cp.idPierna = pi.idPierna
        LEFT JOIN Estadistica e ON p.idPersonaje = e.idPersonaje
        WHERE p.idPersonaje = ?;
    `, [id]);

    if (rows.length === 0) {
        throw new AppError(404, 'Personaje no encontrado');
    }
    return rows[0];
}

async function remove(id) {
    const result = await query('DELETE FROM Personaje WHERE idPersonaje = ?', [id]);
    if (result.affectedRows === 0) {
        throw new AppError(404, 'Personaje no encontrado');
    }
    return { message: 'Personaje eliminado' };
}

async function update(id, data) {
    const {
        nombre, clase, altura, musculatura,
        fuerza, destreza, inteligencia, constitucion, agilidad,
        cabello_corte, cabello_tinte, ojos_color, ojos_forma,
        boca_forma, cabeza_forma, nariz_forma, torso_forma,
        cuernos_cantidad, cuernos_tamanio, cuernos_color, torso_bello,
    } = data;

    return withTransaction(async (conn) => {
        const [basicResult] = await conn.query(`
            UPDATE Personaje
            SET nombre = ?, clase = ?, altura = ?, musculatura = ?
            WHERE idPersonaje = ?
        `, [nombre, clase, altura, musculatura, id]);
        if (basicResult.affectedRows === 0) {
            throw new AppError(404, 'Personaje no encontrado');
        }

        await conn.query(`
            INSERT INTO Estadistica (idPersonaje, fuerza, destreza, inteligencia, constitucion, agilidad, vidaActual, manaActual)
            VALUES (?, ?, ?, ?, ?, ?, 30 + ? * 5, 20 + ? * 5)
            ON DUPLICATE KEY UPDATE
              fuerza = VALUES(fuerza),
              destreza = VALUES(destreza),
              inteligencia = VALUES(inteligencia),
              constitucion = VALUES(constitucion),
              agilidad = VALUES(agilidad),
              vidaActual = LEAST(vidaActual, 30 + VALUES(constitucion) * 5),
              manaActual = LEAST(manaActual, 20 + VALUES(inteligencia) * 5)
        `, [id, fuerza, destreza, inteligencia, constitucion, agilidad, constitucion, inteligencia]);

        await conn.query(`
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
        `, [
            cabello_corte, cabello_tinte,
            boca_forma,
            ojos_color, ojos_forma,
            nariz_forma,
            cuernos_cantidad, cuernos_tamanio, cuernos_color,
            torso_forma, torso_bello,
            cabeza_forma,
            id,
        ]);

        return { message: 'Personaje y apariencia actualizados con éxito' };
    });
}

async function create(data) {
    const {
        nombre, clase, nivel, altura, musculatura,
        fuerza = 10, destreza = 10, inteligencia = 10, constitucion = 10, agilidad = 10,
        cabello_corte = 'Corto', cabello_tinte = 'Castaño', ojos_color = 'Marrón',
        ojos_forma = 'Almendrados', boca_forma = 'Común', cabeza_forma = 'Ovalada',
        nariz_forma = 'Recta', torso_forma = 'Atlético', cuernos_cantidad = 0,
        cuernos_tamanio = 'N/A', cuernos_color = 'N/A', torso_bello = 0,
    } = data;

    return withTransaction(async (conn) => {
        const [boca] = await conn.query('INSERT INTO Boca (Forma, Tamanio, Color) VALUES (?, "Medio", "Rojo")', [boca_forma]);
        const [cabello] = await conn.query('INSERT INTO Cabello (Corte, Tinte) VALUES (?, ?)', [cabello_corte, cabello_tinte]);
        const [nariz] = await conn.query('INSERT INTO Nariz (Forma, Tamanio) VALUES (?, "Medio")', [nariz_forma]);
        const [cuernos] = await conn.query('INSERT INTO Cuernos (Cantidad, Tamanio, Color) VALUES (?, ?, ?)', [cuernos_cantidad, cuernos_tamanio, cuernos_color]);
        const [cejas] = await conn.query('INSERT INTO Cejas (Tinte, Forma) VALUES ("Castaño", "Arqueadas")');
        const [pestanias] = await conn.query('INSERT INTO Pestanias (Forma, Tamanio) VALUES ("Normal", "Medio")');

        const [ojos] = await conn.query(
            'INSERT INTO Ojos (idPestanias, idCejas, Color, Forma, Tamanio) VALUES (?, ?, ?, ?, "Medio")',
            [pestanias.insertId, cejas.insertId, ojos_color, ojos_forma],
        );

        const [cabeza] = await conn.query(
            'INSERT INTO Cabeza (idOJos, idCabello, idBoca, idNariz, idCuernos, Forma) VALUES (?, ?, ?, ?, ?, ?)',
            [ojos.insertId, cabello.insertId, boca.insertId, nariz.insertId, cuernos.insertId, cabeza_forma],
        );

        const [formaBrazo] = await conn.query('INSERT INTO FormaBrazo (Tamanio, Tipo, color) VALUES (70, "Humano", "Piel")');
        const [brazo] = await conn.query('INSERT INTO Brazo (Cantidad, idFormaBrazo) VALUES (2, ?)', [formaBrazo.insertId]);
        const [pierna] = await conn.query('INSERT INTO Pierna (Tamanio, Tipo) VALUES (90, "Humano")');
        const [torso] = await conn.query('INSERT INTO Torso (Forma, Tamanio, Bello) VALUES (?, "Medio", ?)', [torso_forma, torso_bello]);

        const [cuerpo] = await conn.query(
            'INSERT INTO Cuerpo (idBrazo, idPierna, idTorso, idCabeza) VALUES (?, ?, ?, ?)',
            [brazo.insertId, pierna.insertId, torso.insertId, cabeza.insertId],
        );

        const [personaje] = await conn.query(
            'INSERT INTO Personaje (nombre, clase, nivel, altura, musculatura, idCuerpo) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, clase, nivel, altura, musculatura, cuerpo.insertId],
        );

await conn.query(
            'INSERT INTO Estadistica (idPersonaje, fuerza, destreza, inteligencia, constitucion, agilidad, vidaActual, manaActual) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [personaje.insertId, fuerza, destreza, inteligencia, constitucion, agilidad, 30 + constitucion * 5, 20 + inteligencia * 5],
        );

        return { id: personaje.insertId, message: 'Personaje creado con estructura completa y personalizada' };
    });
}

module.exports = { list, detail, remove, update, create };