const express = require('express');
const ninjaControllers = require('../controllers/ninja-controller');

const { getAllNinjas, getNinja, createNinja, updateNinja, deleteNinja } =
  ninjaControllers;

const router = express.Router();

router.route('/').get(getAllNinjas).post(createNinja);
router.route('/:id').get(getNinja).patch(updateNinja).delete(deleteNinja);

module.exports = router;
