const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const routes = require('./routes/index');

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});