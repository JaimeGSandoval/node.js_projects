const getNinjas = 'SELECT * FROM ninjas';

const addNinja =
  'INSERT INTO ninjas (name, email, village) VALUES ($1, $2, $3) RETURNING *';

module.exports = {
  getNinjas,
  addNinja,
};
