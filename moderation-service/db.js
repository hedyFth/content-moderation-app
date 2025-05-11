// moderation-service/db.js
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'contentDB';
const client = new MongoClient(url);

let db;

async function connect() {
  await client.connect();
  db = client.db(dbName);
  console.log('✅ Connected to MongoDB');
}

function getDb() {
  return db;
}

module.exports = { connect, getDb };
