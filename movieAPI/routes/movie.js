const express = require('express');
const movieDetails = require('../data/movieDetails');

const router = express.Router();

const requireJSON = (req, res, next) => {
  if (!req.is('application/json')) {
    res.json({
      message: 'Content-Type must be application/json',
    });
  }

  next();
};

router.param('movieId', (req, res, next) => {
  // possible use cases
  // if only certain apiKeys are allowed to hit movieId
  // if you want update the db with analytics data
  console.log('Someone hit a route that used the movieId wildcard');
  next();
});

/* GET movie page. */
// /movie/...

// GET /movie/top_rated
router.get('/top_rated', (req, res, next) => {
  let page = req.query.page;
  if (!page) {
    page = 1;
  }

  const result = [...movieDetails].sort(
    (a, b) => b.vote_average - a.vote_average
  );

  const indexToStart = (page - 1) * 20;

  res.json(result.slice(indexToStart, indexToStart + 29));
});

// GET /movie/movieId
router.get('/:movieId', (req, res, next) => {
  const movieId = req.params.movieId;
  const result = movieDetails.find((movie) => movie.id === Number(movieId));
  console.log(result);

  if (!result) {
    res.json({
      message: 'Movie ID is not found',
      production_companies: [],
    });
  } else {
    res.json(result);
  }
});

// POST /movie/{movie_id}/rating}
router.post('/:movieId/rating', requireJSON, (req, res, next) => {
  const movieId = req.params.movieId;
  const userRating = req.body.value;
  console.log(userRating);

  if (userRating < 0.5 || userRating > 10) {
    res.json('Rating must be between .5 and 10');
  } else {
    res.status(201).json({
      message: 'Thank you for submitting your rating',
      status: 201,
    });
  }
});

// DELETE /movie/{movie_id}/rating
router.delete('/:movieId/rating', requireJSON, (req, res, next) => {
  res.status(200).json({
    message: 'Rating deleted',
  });
});

module.exports = router;
