/**
 * Movie Booking Backend Server
 * Main entry point that configures Express and MongoDB connection.
 */

const express = require('express');
const bodyParser = require('body-parser');
const env = require('dotenv');
const mongoose = require('mongoose');

const MovieRoutes = require('./routes/movie.routes');
const theatreRoutes = require('./routes/theatre.routes');
const authRoutes = require('./routes/auth.routes');

// Load environment variables (PORT, DB_URL) from the .env file
env.config();

const app = express();

// Middleware: Parse incoming request bodies before they reach the route handlers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Register application routes on the app instance
MovieRoutes(app);
theatreRoutes(app);
authRoutes(app);


// Start the HTTP server first, then establish the DB connection.
// This keeps the server responsive even if the DB is temporarily unavailable.
app.listen(process.env.PORT, async () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);

  try{
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');
  }catch(err){
    console.error('Error while connecting to MongoDB:', err);
  }
});