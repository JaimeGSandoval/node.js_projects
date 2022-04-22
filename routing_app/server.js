const express = require('express');
const path = require('path');
const router = require('./router');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Routing App');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
