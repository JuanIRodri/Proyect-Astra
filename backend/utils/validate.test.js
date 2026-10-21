const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
    validateBody,
    expectIntParam,
    expectEquipmentSlot,
    validateInventoryItems,
    CLASES,
    SLOT_COUNT,
} = require('./validate');
const { AppError } = require('./errors');

const rules = {
    nombre: { type: 'string', maxLength: 40, required: true },
    clase: { enum: CLASES, required: true },
    fuerza: { type: 'number', min: 1, max: 99 },
    nivel: { type: 'integer', min: 1, max: 100 },
    torso_bello: { type: 'boolean' },
};

test('validateBody rejects a body that is not an object', () => {
    assert.throws(() => validateBody(null, rules), AppError);
    assert.throws(() => validateBody('texto', rules), AppError);
});

test('validateBody in create mode requires the required fields', () => {
    assert.throws(() => validateBody({}, rules, 'create'), (error) => error.status === 400
        && /nombre/.test(error.message));
    assert.throws(() => validateBody({ nombre: 'A' }, rules, 'create'), (error) => error.status === 400
        && /clase/.test(error.message));
});

test('validateBody in update mode does not require fields and drops unknown ones', () => {
    const cleaned = validateBody({ nombre: 'A', unexpectedField: 1 }, rules);
    assert.deepEqual(cleaned, { nombre: 'A' });
});

test('validateBody rejects an empty update', () => {
    assert.throws(() => validateBody({}, rules), (error) => error.status === 400);
});

test('validateBody checks types', () => {
    assert.throws(() => validateBody({ nombre: 5 }, rules), (error) => error.status === 400 && /tipo/.test(error.message));
    assert.throws(() => validateBody({ fuerza: 'diez' }, rules), (error) => error.status === 400);
});

test('validateBody checks ranges', () => {
    assert.throws(() => validateBody({ fuerza: 0 }, rules), (error) => error.status === 400);
    assert.throws(() => validateBody({ fuerza: 100 }, rules), (error) => error.status === 400);
    assert.deepEqual(validateBody({ fuerza: 15 }, rules), { fuerza: 15 });
});

test('validateBody checks the maximum length', () => {
    assert.throws(() => validateBody({ nombre: 'x'.repeat(41) }, rules), (error) => error.status === 400);
});

test('validateBody checks enums', () => {
    assert.throws(() => validateBody({ clase: 'Hechicero' }, rules), (error) => error.status === 400);
    assert.deepEqual(validateBody({ clase: 'Guerrero' }, rules), { clase: 'Guerrero' });
});

test('validateBody accepts booleans 0/1', () => {
    assert.deepEqual(validateBody({ torso_bello: 0 }, rules), { torso_bello: 0 });
    assert.deepEqual(validateBody({ torso_bello: true }, rules), { torso_bello: true });
});

test('validateBody checks integers', () => {
    assert.throws(() => validateBody({ nivel: 1.5 }, rules), (error) => error.status === 400 && /tipo/.test(error.message));
    assert.deepEqual(validateBody({ nivel: 3 }, rules), { nivel: 3 });
});

test('expectIntParam validates and returns the integer', () => {
    assert.equal(expectIntParam('7', 'id', { min: 1 }), 7);
    assert.equal(expectIntParam(0, 'ranura', { max: SLOT_COUNT - 1 }), 0);
    assert.throws(() => expectIntParam('abc', 'id'), (error) => error.status === 400);
    assert.throws(() => expectIntParam('0', 'id', { min: 1 }), (error) => error.status === 400);
    assert.throws(() => expectIntParam('48', 'ranura', { max: SLOT_COUNT - 1 }), (error) => error.status === 400);
});

test('expectEquipmentSlot validates the equipment slot key', () => {
    assert.equal(expectEquipmentSlot('casco'), 'casco');
    assert.equal(expectEquipmentSlot('arma-secundaria'), 'arma-secundaria');
    assert.throws(() => expectEquipmentSlot('mochila'), (error) => error.status === 400);
});

test('validateInventoryItems rejects non-arrays and oversized arrays', () => {
    assert.throws(() => validateInventoryItems('no'), (error) => error.status === 400);
    assert.throws(() => validateInventoryItems(new Array(SLOT_COUNT + 1).fill(null)), (error) => error.status === 400);
});

test('validateInventoryItems normalizes quantities and drops invalid items', () => {
    const items = validateInventoryItems([
        { itemKey: 'espada', quantity: '3' },
        { itemKey: 'pocion', quantity: 1 },
        { itemKey: '', quantity: 5 },
        { quantity: 5 },
        { itemKey: 'invalido', quantity: 0 },
        null,
    ]);
    assert.deepEqual(items, [
        { itemKey: 'espada', quantity: 3 },
        { itemKey: 'pocion', quantity: 1 },
        null,
        null,
        null,
        null,
    ]);
});