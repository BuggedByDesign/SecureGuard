const sql = require('mssql');
require('dotenv').config();

const config = {
  user: 'sa',
  password: 'admin123456',
  server: 'localhost',
  database: 'ReviewDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Свързан към MSSQL успешно.');
    return pool;
  })
  .catch(err => {
    console.error('❌ Грешка при свързване с базата:', err);
  });

module.exports = { sql, poolPromise };
