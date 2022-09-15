const pool = require('../database/db');
const queries = require('../queries/index');

const getNinjas = async (req, res) => {
  await pool.query(queries.getNinjas, (error, results) => {
    if (error) {
      return res.status(500).json({
        status: 'Fail',
        message: error.message,
      });
    }

    return res.status(200).json({
      status: 'Success',
      data: {
        ninjas: results.rows,
      },
    });
  });
};

const addNinja = async (req, res) => {
  const { name, email, village } = req.body;

  if (!name || !email || !village) {
    return res.status(400).json({
      status: 'Fail',
      message: 'Name, Email, and Village must each have a value',
    });
  }

  await pool.query(
    queries.addNinja,
    [name, email, village],
    (error, results) => {
      if (error) {
        return res.status(500).json({
          status: 'Fail',
          message: error.message,
        });
      }

      return res.status(201).json({
        status: 'Success',
        data: results.rows,
      });
    }
  );
};

module.exports = {
  getNinjas,
  addNinja,
};
