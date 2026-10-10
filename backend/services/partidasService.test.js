const { test } = require('node:test');
const assert = require('node:assert/strict');
const asyncDb = require('../utils/asyncDb');
const partidas = require('./partidasService');

function queryFrom(...results) {
    let index = 0;
    return async () => (index < results.length ? results[index++] : [{ affectedRows: 1 }]);
}

test('list sets tieneGuardado and parses JSON positions', async (t) => {
    const row = {
        idPartida: 1,
        posiciones: JSON.stringify([{ x: 5, y: 4 }]),
        fechaGuardado: '2026-01-01',
    };
    t.mock.method(asyncDb, 'query', async () => [row]);

    const [result] = await partidas.list();

    assert.equal(result.tieneGuardado, true);
    assert.deepEqual(result.posiciones, [{ x: 5, y: 4 }]);
});

test('list leaves positions as null when they are not an array', async (t) => {
    t.mock.method(asyncDb, 'query', async () => [{ idPartida: 1, posiciones: '{"a":1}', fechaGuardado: null }]);

    const [result] = await partidas.list();

    assert.equal(result.posiciones, null);
    assert.equal(result.tieneGuardado, false);
});

test('detail throws 404 when the save does not exist', async (t) => {
    t.mock.method(asyncDb, 'query', async () => []);
    await assert.rejects(() => partidas.detail(1), (error) => error.status === 404);
});

test('save updates the save and returns its detail', async (t) => {
    const base = { idPartida: 1, mapa: 'mundo', liderX: 5, liderY: 4, liderIndex: 0, posiciones: null };
    t.mock.method(asyncDb, 'query', queryFrom([base], { affectedRows: 1 }, [{ ...base, liderX: 8 }]));

    const result = await partidas.save(1, { liderX: 8, liderY: 9 });

    assert.equal(result.liderX, 8);
});

test('save throws 404 when no rows were affected', async (t) => {
    const base = { idPartida: 1, liderX: 5, liderY: 4, liderIndex: 0, posiciones: null };
    t.mock.method(asyncDb, 'query', queryFrom([base], { affectedRows: 0 }));
    await assert.rejects(() => partidas.save(1, {}), (error) => error.status === 404);
});

test('reset clears the slot and returns its detail', async (t) => {
    const base = { idPartida: 1, mapa: 'mundo', liderX: 5, liderY: 4, liderIndex: 0, posiciones: null };
    const cleared = { idPartida: 1, mapa: null, liderX: null, liderY: null, liderIndex: 0, posiciones: null };
    t.mock.method(asyncDb, 'query', queryFrom([base], { affectedRows: 1 }, [cleared]));

    const result = await partidas.reset(1);

    assert.equal(result.mapa, null);
    assert.equal(result.liderX, null);
});