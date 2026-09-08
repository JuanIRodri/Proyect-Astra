const express = require('express');
const router = express.Router();
const partidasController = require('../controllers/partidasController');

router.get('/', partidasController.getPartidas);
router.get('/:id', partidasController.getPartida);
router.put('/:id', partidasController.savePartida);
router.post('/:id/reset', partidasController.resetPartida);

module.exports = router;