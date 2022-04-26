require('dotenv/config');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

app.use(express.json());

const posts = [
  {
    username: 'naruto',
    title: 'Post 1',
  },
  {
    username: 'ichigo',
    title: 'Post 2',
  },
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token',
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Credentials did not match',
      });
    }

    req.user = user;
    next();
  });
};

app.get('/posts', authenticateToken, (req, res) => {
  const user = posts.filter((post) => post.username === req.user.name);
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

const port = process.env.PORT || 3000;
app.listen(3000, () => console.log(`server.js listening on port ${port}...`));
