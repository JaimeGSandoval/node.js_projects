const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const { data } = JSON.parse(fs.readFileSync('./data/data.json', 'utf-8'));
const ninjas = data;

app.get('/api/v1/ninjas', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      ninjas,
    },
  });
});

app.get('/api/v1/ninjas/:id', (req, res) => {
  const { id } = req.params;
  const ninjaID = Number(id);

  if (Number.isNaN(ninjaID)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid ID. ID must be a number',
    });
  }

  if (id > ninjas.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Ninja not found. Invalid ID',
    });
  }

  const ninja = ninjas.find((ninjaData) => ninjaData.id === Number(id));

  res.status(200).json({
    status: 'success',
    data: {
      ninja,
    },
  });
});

app.post('/api/v1/ninjas', (req, res) => {
  const ninja = req.body;
  if (!ninja.id || !ninja.name) {
    return res.status(400).json({
      status: 'fail',
      message: 'Name and ID must be provided',
    });
  }

  const newNinjas = [...ninjas, ninja];
  res.status(201).json({
    status: 'success',
    data: {
      newNinjas,
    },
  });
});

app.patch('/api/v1/ninjas/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  const ninjaID = Number(id);

  if (!name) {
    return res.status(400).json({
      status: 'fail',
      message: 'A name must be provided',
    });
  }

  if (Number.isNaN(ninjaID)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid ID. ID must be a number',
    });
  }

  const retrievedNinja = ninjas.find((ninja) => ninja.id === ninjaID);

  if (ninjaID > ninjas.length || !retrievedNinja) {
    return res.status(404).json({
      status: 'fail',
      message: 'Ninja not found. Invalid ID',
    });
  }

  const updatedNinjas = ninjas.map((ninja) => {
    if (ninja.id === ninjaID) {
      return {
        ...ninja,
        name,
      };
    }

    return ninja;
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedNinjas,
    },
  });
});

app.delete('/api/v1/ninjas/:id', (req, res) => {
  const { id } = req.params;
  const ninjaID = Number(id);

  if (Number.isNaN(ninjaID)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid ID. ID must be a number',
    });
  }

  const retrievedNinja = ninjas.find((ninja) => ninja.id === ninjaID);

  if (ninjaID > ninjas.length || !retrievedNinja) {
    return res.status(404).json({
      status: 'fail',
      message: 'Ninja not found. Invalid ID',
    });
  }

  const updatedNinjas = ninjas.filter((ninja) => ninja.id !== ninjaID);

  res.status(200).json({
    status: 'success',
    data: {
      updatedNinjas,
    },
  });
});

module.exports = app;
