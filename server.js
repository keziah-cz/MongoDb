const dns = require("dns");

dns.setServers(["8.8.8.8"]);

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const { connectDB } = require('./config/db');
const customerRoutes = require('./routes/customer');
const adminRoutes = require('./routes/admin');
const { logger } = require('./middleware/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger);

app.use(session({
  name: 'studyhub.sid',
  secret: process.env.SESSION_SECRET || 'studyhub-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60
  }
}));

app.use('/', customerRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).send('Page not found.');
});

async function startServer() {
  try {
    await connectDB();

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`StudyHub is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
