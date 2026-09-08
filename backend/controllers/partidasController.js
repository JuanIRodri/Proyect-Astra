const { asyncHandler } = require('../utils/errors');
const partidasService = require('../services/partidasService');

exports.getPartidas = asyncHandler(async (req, res) => {
    const partidas = await partidasService.list();
    res.json(partidas);
});

exports.getPartida = asyncHandler(async (req, res) => {
    const partida = await partidasService.detail(req.params.id);
    res.json(partida);
});

exports.savePartida = asyncHandler(async (req, res) => {
    const partida = await partidasService.save(req.params.id, req.body);
    res.json(partida);
});

exports.resetPartida = asyncHandler(async (req, res) => {
    const partida = await partidasService.reset(req.params.id);
    res.json(partida);
});