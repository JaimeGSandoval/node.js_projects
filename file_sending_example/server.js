const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log('Request Date:', new Date());
  next();
});

app.use((req, res, next) => {
  const filePath = path.join(__dirname, 'static', req.url);
  fs.stat(filePath, (err, fileData) => {
    if (err) {
      console.log(err);
      next();
      return;
    }

    if (fileData.isFile()) {
      res.status(200).sendFile(filePath);
    } else {
      next();
    }
  });
});

app.use((req, res, next) => {
  res.status(404).send('Fille not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`I'm listening on port ${PORT}...`));
