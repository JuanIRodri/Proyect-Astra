require('dotenv').config();
const mysql = require('mysql2/promise');

const rpgData = [
  { id: 1, nombre: 'Xanthar the Bold', clase: 'Guerrero', nivel: 50 },
  { id: 2, nombre: 'Lyra Silverleaf', clase: 'Mago', nivel: 42 },
  { id: 3, nombre: 'Grommash Ironhide', clase: 'Paladín', nivel: 60 },
  { id: 4, nombre: 'Sylvana Nightshade', clase: 'Cazador', nivel: 35 },
  { id: 5, nombre: 'Kaelen Duskrunner', clase: 'Pícaro', nivel: 28 },
  { id: 6, nombre: 'Thalor Brightmane', clase: 'Paladín', nivel: 55 },
  { id: 7, nombre: 'Morana Stormborn', clase: 'Mago', nivel: 12 },
  { id: 8, nombre: 'Valerius Shadowbane', clase: 'Pícaro', nivel: 48 },
  { id: 9, nombre: 'Elowen Moonwhisper', clase: 'Cazador', nivel: 22 },
  { id: 10, nombre: 'Ryker Steelheart', clase: 'Guerrero', nivel: 15 },
  { id: 11, nombre: 'Balthazar the Wise', clase: 'Mago', nivel: 99 },
];

async function migrate() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    });

    console.log('--- Iniciando Migración Completa de Maniquí ---');

    // 1. Crear tablas relacionales del cuerpo si no existen
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Cabello (
        idCabello INT AUTO_INCREMENT PRIMARY KEY,
        Corte VARCHAR(50),
        Tinte VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Ojos (
        idOjos INT AUTO_INCREMENT PRIMARY KEY,
        Color VARCHAR(50),
        Forma VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Boca (
        idBoca INT AUTO_INCREMENT PRIMARY KEY,
        Forma VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Nariz (
        idNariz INT AUTO_INCREMENT PRIMARY KEY,
        Forma VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Cuernos (
        idCuernos INT AUTO_INCREMENT PRIMARY KEY,
        Cantidad INT DEFAULT 0,
        Tamanio VARCHAR(50),
        Color VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Cabeza (
        idCabeza INT AUTO_INCREMENT PRIMARY KEY,
        Forma VARCHAR(50),
        idCabello INT,
        idOjos INT,
        idBoca INT,
        idNariz INT,
        idCuernos INT,
        FOREIGN KEY (idCabello) REFERENCES Cabello(idCabello),
        FOREIGN KEY (idOjos) REFERENCES Ojos(idOjos),
        FOREIGN KEY (idBoca) REFERENCES Boca(idBoca),
        FOREIGN KEY (idNariz) REFERENCES Nariz(idNariz),
        FOREIGN KEY (idCuernos) REFERENCES Cuernos(idCuernos)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Torso (
        idTorso INT AUTO_INCREMENT PRIMARY KEY,
        Forma VARCHAR(50),
        Bello VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Cuerpo (
        idCuerpo INT AUTO_INCREMENT PRIMARY KEY,
        idCabeza INT,
        idTorso INT,
        FOREIGN KEY (idCabeza) REFERENCES Cabeza(idCabeza),
        FOREIGN KEY (idTorso) REFERENCES Torso(idTorso)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Crear tabla Personaje con relaciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Personaje (
        idPersonaje INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        clase VARCHAR(50),
        nivel INT DEFAULT 1,
        altura FLOAT DEFAULT 1.75,
        musculatura VARCHAR(50) DEFAULT 'Normal',
        idCuerpo INT,
        FOREIGN KEY (idCuerpo) REFERENCES Cuerpo(idCuerpo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Asegurar que las columnas existan si la tabla ya había sido creada antes
    const columns = [
      { name: 'nombre', definition: 'VARCHAR(100)' },
      { name: 'clase', definition: 'VARCHAR(50)' },
      { name: 'nivel', definition: 'INT DEFAULT 1' },
      { name: 'altura', definition: 'FLOAT DEFAULT 1.75' },
      { name: 'musculatura', definition: "VARCHAR(50) DEFAULT 'Normal'" },
      { name: 'idCuerpo', definition: 'INT' }
    ];

    for (const col of columns) {
      try {
        await connection.query(`ALTER TABLE Personaje ADD COLUMN ${col.name} ${col.definition}`);
      } catch (err) {
        if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      }
    }

    // 3. Insertar rasgo base por defecto para asociar a los personajes
    await connection.query(`INSERT IGNORE INTO Cabello (idCabello, Corte, Tinte) VALUES (1, 'Corto', 'Castaño')`);
    await connection.query(`INSERT IGNORE INTO Ojos (idOjos, Color, Forma) VALUES (1, 'Marron', 'Almendrados')`);
    await connection.query(`INSERT IGNORE INTO Boca (idBoca, Forma) VALUES (1, 'Estandard')`);
    await connection.query(`INSERT IGNORE INTO Nariz (idNariz, Forma) VALUES (1, 'Recta')`);
    await connection.query(`INSERT IGNORE INTO Cuernos (idCuernos, Cantidad, Tamanio, Color) VALUES (1, 0, 'Ninguno', 'N/A')`);
    await connection.query(`INSERT IGNORE INTO Cabeza (idCabeza, Forma, idCabello, idOjos, idBoca, idNariz, idCuernos) VALUES (1, 'Ovalada', 1, 1, 1, 1, 1)`);
    await connection.query(`INSERT IGNORE INTO Torso (idTorso, Forma, Bello) VALUES (1, 'Atletico', 'Lampiño')`);
    await connection.query(`INSERT IGNORE INTO Cuerpo (idCuerpo, idCabeza, idTorso) VALUES (1, 1, 1)`);

    // 4. Crear o actualizar la tabla Estadistica
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Estadistica (
        idPersonaje INT NOT NULL PRIMARY KEY,
        fuerza INT DEFAULT 10,
        destreza INT DEFAULT 10,
        inteligencia INT DEFAULT 10,
        constitucion INT DEFAULT 10,
        agilidad INT DEFAULT 10,
        CONSTRAINT fk_estadistica_personaje FOREIGN KEY (idPersonaje) REFERENCES Personaje (idPersonaje) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Objeto (
        idObjeto INT AUTO_INCREMENT PRIMARY KEY,
        clave VARCHAR(80) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        rareza VARCHAR(30) NOT NULL,
        peso DECIMAL(6,2) NOT NULL DEFAULT 0,
        icono VARCHAR(10) NOT NULL,
        consumible BOOLEAN NOT NULL DEFAULT FALSE,
        efectoVida INT NOT NULL DEFAULT 0,
        maxPila INT NOT NULL DEFAULT 99,
        tipoEquipamiento VARCHAR(20) DEFAULT NULL,
        bonusFuerza INT NOT NULL DEFAULT 0,
        bonusDestreza INT NOT NULL DEFAULT 0,
        bonusInteligencia INT NOT NULL DEFAULT 0,
        bonusConstitucion INT NOT NULL DEFAULT 0,
        bonusAgilidad INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const equipmentColumns = [
      { name: 'tipoEquipamiento', definition: 'VARCHAR(20) DEFAULT NULL' },
      { name: 'bonusFuerza', definition: 'INT NOT NULL DEFAULT 0' },
      { name: 'bonusDestreza', definition: 'INT NOT NULL DEFAULT 0' },
      { name: 'bonusInteligencia', definition: 'INT NOT NULL DEFAULT 0' },
      { name: 'bonusConstitucion', definition: 'INT NOT NULL DEFAULT 0' },
      { name: 'bonusAgilidad', definition: 'INT NOT NULL DEFAULT 0' },
    ];

    for (const column of equipmentColumns) {
      try {
        await connection.query(`ALTER TABLE Objeto ADD COLUMN ${column.name} ${column.definition}`);
      } catch (err) {
        if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      }
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Inventario (
        idPersonaje INT NOT NULL,
        ranura INT NOT NULL,
        idObjeto INT DEFAULT NULL,
        cantidad INT NOT NULL DEFAULT 0,
        PRIMARY KEY (idPersonaje, ranura),
        CONSTRAINT fk_inventario_personaje FOREIGN KEY (idPersonaje) REFERENCES Personaje(idPersonaje) ON DELETE CASCADE,
        CONSTRAINT fk_inventario_objeto FOREIGN KEY (idObjeto) REFERENCES Objeto(idObjeto) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Equipamiento (
        idPersonaje INT NOT NULL,
        ranura VARCHAR(20) NOT NULL,
        idObjeto INT NOT NULL,
        PRIMARY KEY (idPersonaje, ranura),
        CONSTRAINT fk_equipamiento_personaje FOREIGN KEY (idPersonaje) REFERENCES Personaje(idPersonaje) ON DELETE CASCADE,
        CONSTRAINT fk_equipamiento_objeto FOREIGN KEY (idObjeto) REFERENCES Objeto(idObjeto)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Cargar o actualizar personajes asignando idCuerpo = 1
    for (const char of rpgData) {
      await connection.query(`
        INSERT INTO Personaje (idPersonaje, nombre, clase, nivel, idCuerpo)
        VALUES (?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE 
          nombre = VALUES(nombre),
          clase = VALUES(clase),
          nivel = VALUES(nivel),
          idCuerpo = IFNULL(idCuerpo, 1)
      `, [char.id, char.nombre, char.clase, char.nivel]);
    }

    await connection.query(`
      UPDATE Personaje SET 
        nombre = CONCAT('Héroe #', idPersonaje), 
        clase = 'Aventurero', 
        nivel = 1,
        idCuerpo = 1
      WHERE nombre IS NULL OR idCuerpo IS NULL
    `);

    // 6. Recalcular Estadísticas
    const [personajes] = await connection.query('SELECT idPersonaje, clase, nivel FROM Personaje');
    for (const p of personajes) {
      const totalPoints = 10 + (p.nivel - 1) * 3;
      let fuerza = 10, destreza = 10, inteligencia = 10, constitucion = 10, agilidad = 10;
      let weights = { f: 2, d: 2, i: 2, c: 2, a: 2 };

      if (p.clase === 'Guerrero') weights = { f: 4, d: 1, i: 0.5, c: 3.5, a: 1 };
      else if (p.clase === 'Mago') weights = { f: 0.5, d: 1, i: 6, c: 1, a: 1.5 };
      else if (p.clase === 'Pícaro') weights = { f: 2, d: 4.5, i: 1, c: 1, a: 1.5 };
      else if (p.clase === 'Paladín') weights = { f: 3, d: 1, i: 2, c: 3, a: 1 };
      else if (p.clase === 'Cazador') weights = { f: 1.5, d: 4, i: 1, c: 1.5, a: 2 };

      const totalWeight = weights.f + weights.d + weights.i + weights.c + weights.a;
      fuerza += Math.round((weights.f / totalWeight) * totalPoints);
      destreza += Math.round((weights.d / totalWeight) * totalPoints);
      inteligencia += Math.round((weights.i / totalWeight) * totalPoints);
      constitucion += Math.round((weights.c / totalWeight) * totalPoints);
      agilidad += Math.round((weights.a / totalWeight) * totalPoints);

      const diff = totalPoints - ((fuerza - 10) + (destreza - 10) + (inteligencia - 10) + (constitucion - 10) + (agilidad - 10));
      fuerza += diff;

      await connection.query(`
        INSERT INTO Estadistica (idPersonaje, fuerza, destreza, inteligencia, constitucion, agilidad)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          fuerza = VALUES(fuerza),
          destreza = VALUES(destreza),
          inteligencia = VALUES(inteligencia),
          constitucion = VALUES(constitucion),
          agilidad = VALUES(agilidad)
      `, [p.idPersonaje, fuerza, destreza, inteligencia, constitucion, agilidad]);
    }

    const objetosIniciales = [
      ['astra-potion', 'Poción de Astra', 'Un líquido azul que recupera parte de la vida de un aventurero.', 'Consumible', 'Comun', 0.4, '🧪', 1, 20, 10, null, 0, 0, 0, 0, 0],
      ['ember-shard', 'Fragmento de brasa', 'Una chispa mineral que todavía conserva calor en su interior.', 'Material', 'Raro', 0.15, '◆', 0, 0, 99, null, 0, 0, 0, 0, 0],
      ['field-ration', 'Ración de viaje', 'Comida seca preparada para largas jornadas fuera del refugio.', 'Suministro', 'Comun', 0.5, '◈', 0, 0, 20, null, 0, 0, 0, 0, 0],
      ['old-compass', 'Brújula antigua', 'La aguja apunta hacia el norte incluso bajo las ruinas de Astra.', 'Objeto clave', 'Épico', 2, '✦', 0, 0, 1, null, 0, 0, 0, 0, 0],
      ['iron-greatsword', 'Espadón de hierro', 'Una hoja pesada que premia la fuerza de quien la empuña.', 'Equipamiento', 'Comun', 3.5, '⚔', 0, 0, 1, 'arma', 3, 0, 0, 0, 0],
      ['warden-plate', 'Armadura del guardián', 'Placas reforzadas que protegen al grupo en primera línea.', 'Equipamiento', 'Raro', 8, '🛡', 0, 0, 1, 'pecho', 0, 0, 0, 3, 0],
      ['iron-helmet', 'Casco de hierro', 'Un casco sencillo que protege la cabeza en combate.', 'Equipamiento', 'Comun', 2, '⛑', 0, 0, 1, 'casco', 0, 0, 0, 1, 0],
      ['ranger-pants', 'Pantalón de explorador', 'Prendas reforzadas para moverse con libertad por las ruinas.', 'Equipamiento', 'Comun', 1.5, '▣', 0, 0, 1, 'pantalon', 0, 1, 0, 0, 0],
      ['traveler-boots', 'Botas de viajero', 'Botas ligeras que favorecen el desplazamiento.', 'Equipamiento', 'Comun', 1, '♟', 0, 0, 1, 'botas', 0, 0, 0, 0, 1],
      ['mind-amulet', 'Daga de respaldo', 'Una hoja corta para protegerse cuando el arma principal no basta.', 'Equipamiento', 'Raro', 1.2, '✦', 0, 0, 1, 'arma-secundaria', 0, 2, 0, 0, 0]
    ];

    for (const objeto of objetosIniciales) {
      await connection.query(`
        INSERT INTO Objeto (clave, nombre, descripcion, categoria, rareza, peso, icono, consumible, efectoVida, maxPila, tipoEquipamiento, bonusFuerza, bonusDestreza, bonusInteligencia, bonusConstitucion, bonusAgilidad)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre), descripcion = VALUES(descripcion), categoria = VALUES(categoria),
          rareza = VALUES(rareza), peso = VALUES(peso), icono = VALUES(icono),
          consumible = VALUES(consumible), efectoVida = VALUES(efectoVida), maxPila = VALUES(maxPila),
          tipoEquipamiento = VALUES(tipoEquipamiento), bonusFuerza = VALUES(bonusFuerza),
          bonusDestreza = VALUES(bonusDestreza), bonusInteligencia = VALUES(bonusInteligencia),
          bonusConstitucion = VALUES(bonusConstitucion), bonusAgilidad = VALUES(bonusAgilidad)
      `, objeto);
    }

    const [objetos] = await connection.query('SELECT idObjeto, clave FROM Objeto');
    const objetoIds = Object.fromEntries(objetos.map((objeto) => [objeto.clave, objeto.idObjeto]));
    const inventarioInicial = [
      ['astra-potion', 3],
      ['ember-shard', 8],
      ['field-ration', 5],
      ['old-compass', 1],
      ['iron-greatsword', 1],
      ['warden-plate', 1],
      ['mind-amulet', 1],
      ['iron-helmet', 1],
      ['ranger-pants', 1],
      ['traveler-boots', 1]
    ];

    for (const personaje of personajes) {
      for (const [clave, cantidad] of inventarioInicial) {
        const [existingItems] = await connection.query(
          'SELECT ranura FROM Inventario WHERE idPersonaje = ? AND idObjeto = ?',
          [personaje.idPersonaje, objetoIds[clave]],
        );
        if (existingItems.length > 0) continue;

        const [occupiedSlots] = await connection.query(
          'SELECT ranura FROM Inventario WHERE idPersonaje = ? ORDER BY ranura',
          [personaje.idPersonaje],
        );
        const occupied = new Set(occupiedSlots.map((slot) => slot.ranura));
        let ranura = 0;
        while (occupied.has(ranura)) ranura += 1;

        await connection.query(`
          INSERT INTO Inventario (idPersonaje, ranura, idObjeto, cantidad)
          VALUES (?, ?, ?, ?)
        `, [personaje.idPersonaje, ranura, objetoIds[clave], cantidad]);
      }
    }

    console.log('✅ Esquema y datos actualizados correctamente.');
  } catch (err) {
    console.error('❌ Error en la migración:', err);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();