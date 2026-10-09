const { asyncHandler } = require('../utils/errors');
const {
    validateBody,
    expectIntParam,
    expectEquipmentSlot,
    validateInventoryItems,
    CLASES,
    SLOT_COUNT,
} = require('../utils/validate');
const personajesService = require('../services/personajesService');
const inventarioService = require('../services/inventarioService');

const STAT_RULE = { type: 'number', min: 1, max: 99 };
const TEXT_RULE = (maxLength) => ({ type: 'string', maxLength });

const personajeRules = {
    nombre: { ...TEXT_RULE(40), required: true },
    clase: { enum: CLASES, required: true },
    nivel: { type: 'integer', min: 1, max: 100 },
    altura: { type: 'number', min: 50, max: 250 },
    musculatura: { type: 'number', min: 0, max: 100 },
    fuerza: STAT_RULE,
    destreza: STAT_RULE,
    inteligencia: STAT_RULE,
    constitucion: STAT_RULE,
    agilidad: STAT_RULE,
    cabello_corte: TEXT_RULE(30),
    cabello_tinte: TEXT_RULE(30),
    ojos_color: TEXT_RULE(30),
    ojos_forma: TEXT_RULE(30),
    boca_forma: TEXT_RULE(30),
    cabeza_forma: TEXT_RULE(30),
    nariz_forma: TEXT_RULE(30),
    torso_forma: TEXT_RULE(30),
    cuernos_cantidad: { type: 'integer', min: 0, max: 2 },
    cuernos_tamanio: TEXT_RULE(10),
    cuernos_color: TEXT_RULE(10),
    torso_bello: { type: 'boolean' },
};

exports.getPersonajes = asyncHandler(async (req, res) => {
    const personajes = await personajesService.list();
    res.json(personajes);
});

exports.getPersonajeDetail = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const personaje = await personajesService.detail(id);
    res.json(personaje);
});

exports.deletePersonaje = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const result = await personajesService.remove(id);
    res.json(result);
});

exports.updatePersonaje = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const data = validateBody(req.body, personajeRules);
    const result = await personajesService.update(id, data);
    res.json(result);
});

exports.createPersonaje = asyncHandler(async (req, res) => {
    const data = validateBody(req.body, personajeRules, 'create');
    const result = await personajesService.create(data);
    res.status(201).json(result);
});

exports.getInventario = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const rows = await inventarioService.getInventario(id);
    res.json(rows);
});

exports.saveInventario = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const items = validateInventoryItems(req.body.items);
    const result = await inventarioService.saveInventario(id, items);
    res.json(result);
});

exports.usarObjeto = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const ranura = expectIntParam(req.params.ranura, 'ranura', { max: SLOT_COUNT - 1 });
    const result = await inventarioService.usarObjeto(id, ranura);
    res.json(result);
});

exports.getEquipamiento = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const rows = await inventarioService.getEquipamiento(id);
    res.json(rows);
});

exports.equiparObjeto = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const ranura = expectIntParam(req.params.ranura, 'ranura', { max: SLOT_COUNT - 1 });
    const result = await inventarioService.equiparObjeto(id, ranura);
    res.json(result);
});

exports.desequiparObjeto = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const ranura = expectEquipmentSlot(req.params.ranura);
    const result = await inventarioService.desequiparObjeto(id, ranura);
    res.json(result);
});

exports.transferirObjeto = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const ranura = expectIntParam(req.params.ranura, 'ranura', { max: SLOT_COUNT - 1 });
    const destinoId = expectIntParam(req.body.destinoId, 'destinoId', { min: 1 });
    const result = await inventarioService.transferirObjeto(id, ranura, destinoId);
    res.json(result);
});

exports.desequiparObjetoEnRanura = asyncHandler(async (req, res) => {
    const id = expectIntParam(req.params.id, 'id', { min: 1 });
    const ranura = expectEquipmentSlot(req.params.ranura);
    const ranuraDestino = expectIntParam(req.params.ranuraDestino, 'ranuraDestino', { max: SLOT_COUNT - 1 });
    const result = await inventarioService.desequiparObjetoEnRanura(id, ranura, ranuraDestino);
    res.json(result);
});