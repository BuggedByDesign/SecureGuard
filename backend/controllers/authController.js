const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  const { fullName, password } = req.body;

  if (!fullName || !password) {
    return res.status(400).json({ message: 'Please enter your name and password.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('FullName', sql.NVarChar, fullName)
      .query('SELECT * FROM Users WHERE FullName = @FullName');

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    const token = jwt.sign(
  { id: user.UserID, fullName: user.FullName, isAdmin: user.IsAdmin },
  process.env.JWT_SECRET || 'RickRoll',
  { expiresIn: '1h' }
);


    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        fullName: user.FullName,
        isAdmin: user.IsAdmin
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while logging in.' });
  }
};

const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  try {
    const pool = await poolPromise;

    // Проверка дали потребителят вече съществува
    const checkUser = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @Email');

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: "The email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('FullName', sql.NVarChar, fullName)
      .input('Email', sql.NVarChar, email)
      .input('Password', sql.NVarChar, hashedPassword)
      .query(`
        INSERT INTO Users (FullName, Email, Password, IsAdmin)
        VALUES (@FullName, @Email, @Password, 0)
      `);

    res.status(201).json({ message: "Successful registration!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration error." });
  }
};

module.exports = { loginUser, registerUser };