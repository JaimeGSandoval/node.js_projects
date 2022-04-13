const express = require('express');
const toursController = require('../controllers/toursController');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  checkNameAndPrice,
} = toursController;

const router = express.Router();

router.param('id', checkID);

router.route('/').get(getAllTours).post(checkNameAndPrice, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;

// ROUTES
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// const tourRouter = express.Router();
// const usersRouter = express.Router();

// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
