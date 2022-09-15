const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'dev',
  host: 'localhost',
  database: 'students',
  port: 5432,
});

module.exports = pool;
