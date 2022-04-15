require('dotenv/config');
const app = require('../app');

app.listen(process.env.PORT || 3000, '127.0.0.1', () => {
  console.log("I'm listening...");
});
