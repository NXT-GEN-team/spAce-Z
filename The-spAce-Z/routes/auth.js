const express = require('express');
const router = express.Router();
const admin = require('../firebaseConfig');
const { getFirestore } = require('firebase-admin/firestore');

const db = getFirestore();

// Login Page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Register Page
router.get('/register', (req, res) => {
  res.render('auth/register');
});


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


router.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});


router.post('/registerUser', async (req, res) => {
  const { idToken, username } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email;

    await db.collection('users').doc(uid).set({
      username,
      email,
      createdAt: new Date()
    });

    res.status(200).json({ message: 'User info stored in Firestore.' });
  } catch (err) {
    console.error('Error writing user to Firestore:', err);
    res.status(500).json({ error: 'Failed to store user info.' });
  }
});

module.exports = router;
