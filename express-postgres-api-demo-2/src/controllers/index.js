const e = require('express');
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

const getNinjaById = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  await pool.query(queries.getNinjaById, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        status: 'Fail',
        message: error.message,
      });
    }

    const noNinjaFound = !results.rows.length;

    if (noNinjaFound) {
      return res.status(401).json({
        status: 'Fail',
        message: 'No ninja by the id exists',
      });
    }

    return res.status(200).json({
      status: 'Success',
      data: {
        ninja: results.rows,
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

const deleteNinja = async (req, res) => {
  const id = parseInt(req.params.id);

  await pool.query(queries.deleteNinja, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        status: 'Fail',
        message: error.message,
      });
    }

    const noNinjaFound = !results.rows.length;

    if (noNinjaFound) {
      return res.status(400).json({
        status: 'Fail',
        message: 'No ninja found by that id',
      });
    }

    return res.status(200).json({
      status: 'Success',
      data: null,
      message: `Ninja by name of ${results.rows[0].name} deleted`,
    });
  });
};

const updateNinja = async (req, res) => {
  const id = parseInt(req.params.id);
  const reqBodyKeys = Object.keys(req.body);
  const reqBodyValues = Object.values(req.body);

  const placeholders = reqBodyKeys.map((_, index) => `$${index + 1}`).join(',');

  let updateQuery;

  if (placeholders === '$1') {
    // what query will be when there's only one update value:
    // UPDATE ninjas SET name = $1 WHERE id = 1 RETURNING *
    // query = `UPDATE ninjas SET ${reqBodyKeys} = ${placeholders} WHERE id = ${id} RETURNING *`;
    updateQuery = queries.updateNinjaWithSingleValue(
      reqBodyKeys,
      placeholders,
      id
    );
  } else {
    // what query will look like if there's more than one update value, .i.e two or three or how ever many:
    // UPDATE ninjas SET (name,village,email) = ($1,$2,$3) WHERE id = 1 RETURNING *
    // query = `UPDATE ninjas SET (${reqBodyKeys}) = (${placeholders}) WHERE id = ${id} RETURNING *`;
    updateQuery = queries.updateNinjaWithMultipleValues(
      reqBodyKeys,
      placeholders,
      id
    );
  }

  await pool.query(updateQuery, [...reqBodyValues], (error, results) => {
    if (error) {
      return res.status(500).json({
        status: 'Fail',
        message: error.message,
      });
    }

    const noNinjaFound = !results.rows.length;

    if (noNinjaFound) {
      return res.status(400).json({
        status: 'Fail',
        message: 'No ninja by that id exists',
      });
    }

    return res.status(200).json({
      status: 'Success',
      data: {
        updatedNinja: results.rows,
      },
    });
  });
};

module.exports = {
  getNinjas,
  getNinjaById,
  addNinja,
  deleteNinja,
  updateNinja,
};
