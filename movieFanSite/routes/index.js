const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const apiKey = '1fb720b97cc13e580c2c35e1138f90f8';
const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();
});

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    const response = await fetch(nowPlayingUrl);
    const movieData = await response.json();

    res.render('index', {
      parsedData: movieData.results,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/movie/:id', async (req, res, next) => {
  const movieId = req.params.id;
  const thisMovieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`;
  const fetchedMovieData = await fetch(thisMovieUrl);
  const movieData = await fetchedMovieData.json();

  console.log(movieData);
  res.render('single-movie', {
    movieData,
  });
});

router.post('/search', async (req, res, next) => {
  const userSearchTerm = encodeURI(req.body.movieSearch);
  const cat = req.body.cat;
  const movieUrl = `${apiBaseUrl}/search/${cat}?query=${userSearchTerm}&api_key=${apiKey}`;

  const fetchedData = await fetch(movieUrl);
  const parsedData = await fetchedData.json();

  if (cat === 'person') {
    parsedData.results = parsedData.results[0].known_for;
  }

  res.render('index', {
    parsedData: parsedData.results,
  });
});

module.exports = router;
