const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const indexRoutes = require('./routes/index');

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Use routes
app.use('/', indexRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});