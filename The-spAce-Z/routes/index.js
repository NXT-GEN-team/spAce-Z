const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('homepage');
});
router.get('/astro', (req, res) => {
  res.render('astro');
});
router.get('/space-objects', (req, res) => {
  res.render('space-objects');
});
router.get('/missions', (req, res) => {
  res.render('missions');
});
router.get('/earth', (req, res) => {
  res.render('earth');
});
router.get('/research', (req, res) => {
  res.render('research');
});

module.exports = router;