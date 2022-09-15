const { Router } = require('express');
const controller = require('../controllers/index.js');

const ninjaRouter = Router();

ninjaRouter.get('/', controller.getNinjas);
ninjaRouter.getNinja('/:id', controller.getNinja);
ninjaRouter.post('/', controller.addNinja);

module.exports = ninjaRouter;
