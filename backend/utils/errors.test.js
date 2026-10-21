const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AppError, asyncHandler } = require('./errors');

test('AppError keeps status and message', () => {
    const error = new AppError(404, 'No encontrado');
    assert.equal(error.status, 404);
    assert.equal(error.message, 'No encontrado');
    assert.ok(error instanceof Error);
});

test('asyncHandler responds when the handler succeeds', async () => {
    const handler = asyncHandler(async (_req, res) => {
        res.json({ ok: true });
    });

    const res = { json: (body) => assert.deepEqual(body, { ok: true }) };
    await handler({}, res);
});

test('asyncHandler maps AppError to its status', async () => {
    const handler = asyncHandler(async () => {
        throw new AppError(400, 'Datos inválidos');
    });

    const res = {
        status(code) {
            assert.equal(code, 400);
            return this;
        },
        json(body) {
            assert.deepEqual(body, { error: 'Datos inválidos' });
        },
    };
    await handler({}, res);
});

test('asyncHandler responds 500 on unknown errors', async () => {
    const handler = asyncHandler(async () => {
        throw new Error('Se rompió algo');
    });

    const res = {
        status(code) {
            assert.equal(code, 500);
            return this;
        },
        json(body) {
            assert.deepEqual(body, { error: 'Se rompió algo' });
        },
    };
    await handler({}, res);
});