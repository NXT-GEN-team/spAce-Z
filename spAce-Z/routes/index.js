const express = require('express');
const router = express.Router();

// Login route
router.get('/login', (req, res) => {
  res.render('login');
});

// Signup route
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Homepage route
router.get('/homepage', (req, res) => {
  res.render('homepage');
});

// Module route with dynamic ID
router.get('/module/:id', (req, res) => {
  const moduleId = req.params.id;
  res.render('module', { moduleId });
});

module.exports = router;
