const express = require('express');
const helmet = require('helmet');
const router = require('./theRouter');
const userRouter = require('./userRouter');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', router);
app.get('/user', userRouter);

app.listen(3000);
