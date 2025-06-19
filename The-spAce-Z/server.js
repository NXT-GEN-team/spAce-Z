const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const routes = require('./routes/index');
const authRoutes = require('./routes/auth');
const admin = require('./firebaseConfig');


function checkAuth(req, res, next) {
  const sessionCookie = req.cookies.session || '';

  admin.auth().verifySessionCookie(sessionCookie, true)
    .then((decodedClaims) => {
      req.user = decodedClaims;
      next();
    })
    .catch((error) => {
      res.redirect('/login');
    });
}


app.set('view engine', 'ejs');

app.use(authRoutes);


app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});