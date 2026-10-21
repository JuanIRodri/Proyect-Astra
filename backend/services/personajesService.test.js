const { test } = require('node:test');
const assert = require('node:assert/strict');
const asyncDb = require('../utils/asyncDb');
const service = require('./personajesService');

function connFrom(...results) {
    let index = 0;
    return {
        query: async () => (index < results.length ? results[index++] : [{ affectedRows: 1 }]),
    };
}

test('list returns the rows from asyncDb.query', async (t) => {
    const rows = [{ idPersonaje: 1, nombre: 'Astra' }];
    t.mock.method(asyncDb, 'query', async () => rows);
    assert.deepEqual(await service.list(), rows);
});

test('detail throws 404 when there are no rows', async (t) => {
    t.mock.method(asyncDb, 'query', async () => []);
    await assert.rejects(() => service.detail(1), (error) => error.status === 404);
});

test('detail returns the first row', async (t) => {
    const rows = [{ idPersonaje: 2, nombre: 'Astra' }];
    t.mock.method(asyncDb, 'query', async () => rows);
    assert.deepEqual(await service.detail(2), rows[0]);
});

test('remove throws 404 when no rows were affected', async (t) => {
    t.mock.method(asyncDb, 'query', async () => ({ affectedRows: 0 }));
    await assert.rejects(() => service.remove(1), (error) => error.status === 404);
});

test('remove returns the deletion confirmation', async (t) => {
    t.mock.method(asyncDb, 'query', async () => ({ affectedRows: 1 }));
    assert.deepEqual(await service.remove(1), { message: 'Personaje eliminado' });
});

test('update throws 400 when there are no valid fields', async () => {
    await assert.rejects(() => service.update(1, {}), (error) => error.status === 400);
});

test('update writes basic columns and stats in a single transaction', async (t) => {
    const queries = [];
    const conn = {
        query: async (sql) => {
            queries.push(sql);
            return [{ affectedRows: 1 }];
        },
    };
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await service.update(1, {
        nombre: 'Astra',
        clase: 'Paladín',
        fuerza: 15,
        destreza: 12,
        inteligencia: 10,
        constitucion: 13,
        agilidad: 9,
    });

    assert.match(queries[0], /UPDATE Personaje[\s\S]*SET nombre = \?, clase = \?/);
    assert.match(queries[1], /INSERT INTO Estadistica /);
    assert.equal(result.message, 'Personaje y apariencia actualizados con éxito');
});

test('update throws 404 when the character does not exist', async (t) => {
    const conn = connFrom([{ affectedRows: 0 }]);
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));
    await assert.rejects(() => service.update(1, { nombre: 'A' }), (error) => error.status === 404);
});

test('update skips stats when they are not all present', async (t) => {
    const queries = [];
    const conn = {
        query: async (sql) => {
            queries.push(sql);
            return [{ affectedRows: 1 }];
        },
    };
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    await service.update(1, { nombre: 'Only name' });

    assert.equal(queries.length, 1);
    assert.doesNotMatch(queries[0], /Estadistica/);
});

test('create builds the full structure in a transaction', async (t) => {
    const conn = { query: async () => [{ insertId: 7 }] };
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    const result = await service.create({ nombre: 'Astra', clase: 'Mago' });

    assert.equal(result.id, 7);
    assert.match(result.message, /Personaje creado/);
});

test('create applies stat and appearance defaults', async (t) => {
    const calls = [];
    const conn = {
        query: async (sql, params) => {
            calls.push({ sql, params });
            return [{ insertId: 7 }];
        },
    };
    t.mock.method(asyncDb, 'withTransaction', async (run) => run(conn));

    await service.create({ nombre: 'Astra', clase: 'Mago' });

    const statsInsert = calls.find(({ sql }) => /INSERT INTO Estadistica/.test(sql));
    assert.deepEqual(statsInsert.params, [7, 10, 10, 10, 10, 10, 80, 70]);
});