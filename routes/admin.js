const express = require('express');
const bcrypt = require('bcrypt');
const { getDB } = require('../config/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.get('/login', (req, res) => {
  res.redirect('/login');
});

router.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const users = await getDB().collection('users').countDocuments();
    const materials = await getDB().collection('materials').countDocuments();

    res.render('admin/dashboard', {
      user: req.session.user,
      stats: { users, materials }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).send('Unable to load dashboard.');
  }
});

module.exports = router;
