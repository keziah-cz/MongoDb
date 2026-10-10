const express = require('express');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/shop');
  return res.redirect('/login');
});

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/shop');

  res.render('customer/login', {
    error: null,
    email: '',
    registered: req.query.registered === '1'
  });
});

router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  try {
    const user = await getDB().collection('users').findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render('customer/login', {
        error: 'Invalid email or password.',
        email,
        registered: false
      });
    }

    req.session.regenerate((error) => {
      if (error) return res.status(500).send('Could not create session.');

      req.session.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      };

      req.session.save((saveError) => {
        if (saveError) return res.status(500).send('Could not save session.');
        res.redirect('/shop');
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Unable to sign in.');
  }
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/shop');

  res.render('customer/register', {
    error: null,
    name: '',
    email: ''
  });
});

router.post('/register', async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const confirmPassword = req.body.confirmPassword || '';

  if (!name || !email || !password || password !== confirmPassword) {
    return res.status(400).render('customer/register', {
      error: 'Please complete all fields and make sure passwords match.',
      name,
      email
    });
  }

  if (password.length < 6) {
    return res.status(400).render('customer/register', {
      error: 'Password must be at least 6 characters.',
      name,
      email
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await getDB().collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });

    res.redirect('/login?registered=1');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).render('customer/register', {
        error: 'Email is already registered.',
        name,
        email
      });
    }

    console.error('Registration error:', error);
    res.status(500).send('Unable to create account.');
  }
});

router.post('/logout', requireLogin, (req, res) => {
  req.session.destroy((error) => {
    if (error) return res.status(500).send('Unable to log out.');
    res.clearCookie('studyhub.sid');
    res.redirect('/login');
  });
});

router.get('/shop', requireLogin, async (req, res) => {
  try {
    const materials = await getDB()
      .collection('materials')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.render('customer/shop', {
      user: req.session.user,
      materials,
      success: req.query.success || '',
      error: ''
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Could not load StudyHub.');
  }
});

router.post('/materials/create', requireLogin, async (req, res) => {
  const title = (req.body.title || '').trim();
  const subject = (req.body.subject || '').trim();
  const description = (req.body.description || '').trim();

  if (!title || !subject) {
    return res.redirect('/shop?success=' + encodeURIComponent('Title and subject are required.'));
  }

  try {
    await getDB().collection('materials').insertOne({
      title,
      subject,
      description,
      createdBy: req.session.user.id,
      createdAt: new Date()
    });

    res.redirect('/shop?success=' + encodeURIComponent('Study material added.'));
  } catch (error) {
    console.error('Create material error:', error);
    res.redirect('/shop?success=' + encodeURIComponent('Could not add material.'));
  }
});

router.post('/materials/:id/update', requireLogin, async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.redirect('/shop');

  const title = (req.body.title || '').trim();
  const subject = (req.body.subject || '').trim();
  const description = (req.body.description || '').trim();

  try {
    await getDB().collection('materials').updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, subject, description, updatedAt: new Date() } }
    );

    res.redirect('/shop?success=' + encodeURIComponent('Study material updated.'));
  } catch (error) {
    console.error('Update material error:', error);
    res.redirect('/shop?success=' + encodeURIComponent('Could not update material.'));
  }
});

router.post('/materials/:id/delete', requireLogin, async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) return res.redirect('/shop');

  try {
    await getDB().collection('materials').deleteOne({ _id: new ObjectId(id) });
    res.redirect('/shop?success=' + encodeURIComponent('Study material deleted.'));
  } catch (error) {
    console.error('Delete material error:', error);
    res.redirect('/shop?success=' + encodeURIComponent('Could not delete material.'));
  }
});

module.exports = router;
