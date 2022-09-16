const { Router } = require('express');
const controller = require('../controllers/index.js');

const ninjaRouter = Router();

ninjaRouter.get('/', controller.getNinjas);
ninjaRouter.get('/:id', controller.getNinjaById);
ninjaRouter.post('/', controller.addNinja);
ninjaRouter.delete('/:id', controller.deleteNinja);
ninjaRouter.put('/:id', controller.updateNinja);

module.exports = ninjaRouter;
