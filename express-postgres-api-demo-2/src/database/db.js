const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'dev',
  database: 'ninjas',
  port: 5432,
  host: 'localhost',
});

module.exports = pool;
