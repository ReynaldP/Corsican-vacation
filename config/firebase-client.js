const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getDatabase } = require('firebase/database');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase Client
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

module.exports = { auth, db };