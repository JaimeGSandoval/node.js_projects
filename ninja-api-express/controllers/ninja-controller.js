const fs = require('fs');

const { data } = JSON.parse(
  fs.readFileSync(`${__dirname}/../data/data.json`, 'utf-8')
);
const ninjas = data;

exports.getAllNinjas = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      ninjas,
    },
  });

  next();
};

exports.getNinja = (req, res, next) => {
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

  next();
};

exports.createNinja = (req, res, next) => {
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
};

exports.updateNinja = (req, res, next) => {
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
};

exports.deleteNinja = (req, res, next) => {
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
};
