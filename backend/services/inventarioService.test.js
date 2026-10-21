const { test } = require('node:test');
const assert = require('node:assert/strict');
const asyncDb = require('../utils/asyncDb');
const inventario = require('./inventarioService');

function connFrom(...results) {
    let index = 0;
    return {
        query: async () => (index < results.length ? results[index++] : [{ affectedRows: 1 }]),
    };
}

test('getInventario delegates the SELECT', async (t) => {
    const rows = [{ ranura: 0, itemKey: 'espada' }];
    t.mock.method(asyncDb, 'query', async () => rows);
    assert.deepEqual(await inventario.getInventario(1), rows);
});

test('getEquipamiento delegates the SELECT', async (t) => {
    const rows = [{ ranura: 'casco', itemKey: 'yelmo' }];
    t.mock.method(asyncDb, 'query', async () => rows);
    assert.deepEqual(await inventario.getEquipamiento(1), rows);
});

test('saveInventario clears and reinserts only valid items', async (t) => {
    const queries = [];
    const conn = {
        query: async (sql) => {
            queries.push(sql);
            if (/SELECT idObjeto/.test(sql)) return [[{ idObjeto: 9 }]];
            return [{ affectedRows: 1 }];
        },
    };
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await inventario.saveInventario(1, [
        { itemKey: 'espada', quantity: 2 },
        null,
        { itemKey: 'fantasma', quantity: 0 },
    ]);

    assert.match(queries[0], /DELETE FROM Inventario/);
    const inserts = queries.filter((sql) => /INSERT INTO Inventario/.test(sql));
    assert.equal(inserts.length, 1);
    assert.equal(result.message, 'Inventario guardado');
});

test('usarObjeto throws 404 when the slot is empty', async (t) => {
    const conn = connFrom([[]]);
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.usarObjeto(1, 0), (error) => error.status === 404);
});

test('usarObjeto throws 400 when the item is not consumable', async (t) => {
    const conn = connFrom([[{ cantidad: 1, nombre: 'Espada', consumible: 0, efectoVida: 0 }]]);
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.usarObjeto(1, 0), (error) => error.status === 400);
});

test('usarObjeto consumes, lowers the quantity and returns the effect', async (t) => {
    const conn = connFrom(
        [[{ cantidad: 3, nombre: 'Poción', consumible: 1, efectoVida: 5 }]],
        [{ affectedRows: 1 }],
        [[{ constitucion: 11, inteligencia: 10, vidaActual: 50, manaActual: 20 }]],
        [{ affectedRows: 1 }],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await inventario.usarObjeto(1, 0);

    assert.equal(result.effect.vida, 5);
    assert.equal(result.quantity, 2);
    assert.equal(result.effect.vidaActual, 55);
});

test('usarObjeto deletes the stack at zero and caps at vidaMax', async (t) => {
    const conn = connFrom(
        [[{ cantidad: 1, nombre: 'Poción', consumible: 1, efectoVida: 10 }]],
        [{ affectedRows: 1 }],
        [[{ constitucion: 11, inteligencia: 10, vidaActual: 80, manaActual: 20 }]],
        [{ affectedRows: 1 }],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await inventario.usarObjeto(1, 0);

    assert.equal(result.quantity, 0);
    assert.equal(result.effect.vidaActual, 85); // 30 + 11*5 = 85
});

test('equiparObjeto throws 400 when the slot is empty', async (t) => {
    const conn = connFrom([[]]);
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.equiparObjeto(1, 0), (error) => error.status === 400);
});

test('equiparObjeto throws 400 when not equippable or stacked', async (t) => {
    const notEquippable = connFrom([[{ idObjeto: 3, cantidad: 1, tipoEquipamiento: null, nombre: 'Poción' }]]);
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(notEquippable));
    await assert.rejects(() => inventario.equiparObjeto(1, 0), (error) => error.status === 400);

    const stacked = connFrom([[{ idObjeto: 3, cantidad: 2, tipoEquipamiento: 'casco', nombre: 'Casco' }]]);
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(stacked));
    await assert.rejects(() => inventario.equiparObjeto(1, 0), (error) => error.status === 400);
});

test('equiparObjeto throws 400 when the equipment slot is occupied', async (t) => {
    const conn = connFrom(
        [[{ idObjeto: 3, cantidad: 1, tipoEquipamiento: 'casco', nombre: 'Casco' }]],
        [[{ idObjeto: 9 }]],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.equiparObjeto(1, 0), (error) => error.status === 400);
});

test('equiparObjeto moves the item into the equipment slot', async (t) => {
    const conn = connFrom(
        [[{ idObjeto: 3, cantidad: 1, tipoEquipamiento: 'casco', nombre: 'Casco' }]],
        [[]],
        [{ affectedRows: 1 }],
        [{ affectedRows: 1 }],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await inventario.equiparObjeto(1, 0);

    assert.equal(result.ranura, 'casco');
});

test('desequiparObjeto throws 400 when the slot is empty', async (t) => {
    const conn = connFrom([[]]);
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.desequiparObjeto(1, 'casco'), (error) => error.status === 400);
});

test('desequiparObjeto finds the first free slot', async (t) => {
    const conn = connFrom(
        [[{ idObjeto: 3, clave: 'casco', nombre: 'Casco' }]],
        [[{ ranura: 0 }, { ranura: 1 }]],
        [{ affectedRows: 1 }],
        [{ affectedRows: 1 }],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await inventario.desequiparObjeto(1, 'casco');

    assert.equal(result.ranura, 2);
});

test('transferirObjeto throws 400 when targeting the same character', async (t) => {
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(connFrom()));
    await assert.rejects(() => inventario.transferirObjeto(1, 0, 1), (error) => error.status === 400);
});

test('transferirObjeto throws 404 when the target does not exist', async (t) => {
    const conn = connFrom([[]]);
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.transferirObjeto(1, 0, 2), (error) => error.status === 404);
});

test('transferirObjeto throws 404 when the source slot is empty', async (t) => {
    const conn = connFrom(
        [[{ idPersonaje: 2 }]],
        [[]],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.transferirObjeto(1, 0, 2), (error) => error.status === 404);
});

test('transferirObjeto throws 400 when the target is full', async (t) => {
    const occupied = Array.from({ length: 48 }, (_, ranura) => ({ ranura }));
    const conn = connFrom(
        [[{ idPersonaje: 2 }]],
        [[{ idObjeto: 3, cantidad: 5, nombre: 'Poción', maxPila: 10 }]],
        [[]],
        [occupied],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.transferirObjeto(1, 0, 2), (error) => error.status === 400);
});

test('transferirObjeto merges into target stacks and leaves the rest in a free slot', async (t) => {
    const conn = connFrom(
        [[{ idPersonaje: 2 }]],
        [[{ idObjeto: 3, cantidad: 5, nombre: 'Poción', maxPila: 10 }]],
        [[{ ranura: 2, cantidad: 8 }]],
        [{ affectedRows: 1 }],
        [[{ ranura: 0 }, { ranura: 1 }]],
        [{ affectedRows: 1 }],
        [{ affectedRows: 1 }],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await inventario.transferirObjeto(1, 0, 2);

    assert.equal(result.message, 'Poción transferido');
    assert.equal(result.cantidad, 5);
});

test('desequiparObjetoEnRanura throws 400 on an invalid target slot', async (t) => {
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(connFrom()));
    await assert.rejects(() => inventario.desequiparObjetoEnRanura(1, 'casco', 48), (error) => error.status === 400);
});

test('desequiparObjetoEnRanura throws 400 when the slot is occupied', async (t) => {
    const conn = connFrom(
        [[{ idObjeto: 3, clave: 'casco', nombre: 'Casco' }]],
        [[{ ranura: 4 }]],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => inventario.desequiparObjetoEnRanura(1, 'casco', 4), (error) => error.status === 400);
});

test('desequiparObjetoEnRanura unequips directly to the requested slot', async (t) => {
    const conn = connFrom(
        [[{ idObjeto: 3, clave: 'casco', nombre: 'Casco' }]],
        [[]],
        [{ affectedRows: 1 }],
        [{ affectedRows: 1 }],
    );
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await inventario.desequiparObjetoEnRanura(1, 'casco', 12);

    assert.equal(result.ranura, 12);
});