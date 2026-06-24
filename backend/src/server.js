require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});