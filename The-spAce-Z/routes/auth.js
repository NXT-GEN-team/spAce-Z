const express = require('express');
const router = express.Router();
const admin = require('../firebaseConfig');

// Login Page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Register Page
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Firebase Session Login
router.post('/sessionLogin', async (req, res) => {
  const idToken = req.body.token;
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    const options = { maxAge: expiresIn, httpOnly: true, secure: false };
    res.cookie('session', sessionCookie, options);
    res.status(200).send({ status: 'success' });
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});

module.exports = router;
