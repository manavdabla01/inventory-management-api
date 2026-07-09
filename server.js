require('dotenv').config();

const app = require('./app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    
    const connection = await pool.getConnection();
    connection.release();
    console.log('Connected to MySQL database');
  
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not connect to the database:', error.message);
    process.exit(1)
  }
}


startServer();