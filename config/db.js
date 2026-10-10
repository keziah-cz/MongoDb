const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectDB() {
  if (db) return db;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in your .env file.');
  }

  await client.connect();
  db = client.db(process.env.MONGODB_DB || 'studyhub');

  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('materials').createIndex({ createdAt: -1 });

  console.log('MongoDB connected successfully.');
  return db;
}

function getDB() {
  if (!db) {
    throw new Error('MongoDB is not connected yet.');
  }

  return db;
}

module.exports = { connectDB, getDB };
