require('dotenv/config'); // WSL solution config file must be name .env and not config.env

const app = require('../app');

// doesn't work with WSL
// const dotenv = require('dotenv');
// dotenv.config({ path: '../.env' });

// console.log(app.get('env'));
// console.log(process.env.PORT);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Application running on ${port}...`));
