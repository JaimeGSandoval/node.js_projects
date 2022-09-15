const express = require('express');
const studentRoutes = require('./student/routes');

const app = express();
app.use(express.json());
const port = 3000;

app.get('/', (req, res) => {
  res.send('Chidori');
});

app.use('/api/v1/students', studentRoutes);

app.listen(port, () => console.log(`Listening on port ${port}....`));
