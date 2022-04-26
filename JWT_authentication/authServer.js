require('dotenv/config');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let refreshTokens = [];

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '45s' });
};

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;

  if (refreshToken === null) {
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized',
    });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({
      status: 'fail',
      message: 'Unauthorized',
    });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'fail',
        message: 'Error validating refresh token',
      });
    }

    const accessToken = generateAccessToken({ name: user.name });

    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
      },
    });
  });
});

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

  refreshTokens.push(refreshToken);

  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`authServer.js listening on port ${port}...`)
);
