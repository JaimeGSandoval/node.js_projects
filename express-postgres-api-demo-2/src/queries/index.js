const getNinjas = 'SELECT * FROM ninjas';

const getNinjaById = 'SELECT * FROM ninjas WHERE id = $1';

const addNinja =
  'INSERT INTO ninjas (name, email, village) VALUES ($1, $2, $3) RETURNING *';

const deleteNinja = 'DELETE FROM ninjas WHERE id = $1 RETURNING (name)';

// const updateNinja =
//   'UPDATE ninjas SET name = $2, email = $3, village = $4 WHERE id = $1 RETURNING *';

const updateNinjaWithSingleValue = (reqKeys, queryPlaceholders, id) =>
  `UPDATE ninjas SET ${reqKeys} = ${queryPlaceholders} WHERE id = ${id} RETURNING *`;

const updateNinjaWithMultipleValues = (reqKeys, queryPlaceholders, id) =>
  `UPDATE ninjas SET (${reqKeys}) = (${queryPlaceholders}) WHERE id = ${id} RETURNING *`;

module.exports = {
  getNinjas,
  getNinjaById,
  addNinja,
  deleteNinja,
  updateNinjaWithSingleValue,
  updateNinjaWithMultipleValues,
};
