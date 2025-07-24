const bcrypt = require('bcryptjs');

const plainPassword = 'admin123456';

bcrypt.hash(plainPassword, 10, function(err, hash) {
  if (err) throw err;
  console.log('Хешираната парола е:', hash);
});
