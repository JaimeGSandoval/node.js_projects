require('dotenv/config');
const express = require('express');

const app = express();

app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`I'm listening on port ${port}...`));
