const express = require('express');
const router = express.Router();
const personajesController = require('../controllers/personajesController');

router.get('/', personajesController.getPersonajes);
router.get('/:id/inventario', personajesController.getInventario);
router.put('/:id/inventario', personajesController.saveInventario);
router.post('/:id/inventario/:ranura/usar', personajesController.usarObjeto);
router.get('/:id/equipamiento', personajesController.getEquipamiento);
router.post('/:id/inventario/:ranura/equipar', personajesController.equiparObjeto);
router.post('/:id/inventario/:ranura/transferir', personajesController.transferirObjeto);
router.post('/:id/equipamiento/:ranura/desequipar', personajesController.desequiparObjeto);
router.get('/:id', personajesController.getPersonajeDetail);
router.post('/', personajesController.createPersonaje);
router.put('/:id', personajesController.updatePersonaje);
router.delete('/:id', personajesController.deletePersonaje);

module.exports = router;
