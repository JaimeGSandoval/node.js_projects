const express = require('express');
const ninjaRouter = require('./routes/index');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('We gooooood');
});

app.use('/api/v1/ninjas', ninjaRouter);
app.all('*', (req, res) => {
  res.send("404 That page ain't here");
});

const port = 3000;
app.listen(port, () => console.log(`On port ${port}`));
