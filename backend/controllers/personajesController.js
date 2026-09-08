const { asyncHandler } = require('../utils/errors');
const personajesService = require('../services/personajesService');
const inventarioService = require('../services/inventarioService');

exports.getPersonajes = asyncHandler(async (req, res) => {
    const personajes = await personajesService.list();
    res.json(personajes);
});

exports.getPersonajeDetail = asyncHandler(async (req, res) => {
    const personaje = await personajesService.detail(req.params.id);
    res.json(personaje);
});

exports.deletePersonaje = asyncHandler(async (req, res) => {
    const result = await personajesService.remove(req.params.id);
    res.json(result);
});

exports.updatePersonaje = asyncHandler(async (req, res) => {
    const result = await personajesService.update(req.params.id, req.body);
    res.json(result);
});

exports.createPersonaje = asyncHandler(async (req, res) => {
    const result = await personajesService.create(req.body);
    res.status(201).json(result);
});

exports.getInventario = asyncHandler(async (req, res) => {
    const rows = await inventarioService.getInventario(req.params.id);
    res.json(rows);
});

exports.saveInventario = asyncHandler(async (req, res) => {
    const result = await inventarioService.saveInventario(req.params.id, req.body.items);
    res.json(result);
});

exports.usarObjeto = asyncHandler(async (req, res) => {
    const result = await inventarioService.usarObjeto(req.params.id, req.params.ranura);
    res.json(result);
});

exports.getEquipamiento = asyncHandler(async (req, res) => {
    const rows = await inventarioService.getEquipamiento(req.params.id);
    res.json(rows);
});

exports.equiparObjeto = asyncHandler(async (req, res) => {
    const result = await inventarioService.equiparObjeto(req.params.id, req.params.ranura);
    res.json(result);
});

exports.desequiparObjeto = asyncHandler(async (req, res) => {
    const result = await inventarioService.desequiparObjeto(req.params.id, req.params.ranura);
    res.json(result);
});

exports.transferirObjeto = asyncHandler(async (req, res) => {
    const result = await inventarioService.transferirObjeto(req.params.id, req.params.ranura, req.body.destinoId);
    res.json(result);
});