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
const userRoutes = require('./routes/user.routes');
const bookingRoutes = require('./routes/booking.routes');
const showRoutes = require('./routes/show.routes');

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
userRoutes(app);
bookingRoutes(app);
showRoutes(app);

// Connect to MongoDB first, then start the HTTP server.
// This prevents requests from arriving before the DB is ready,
// which would cause Mongoose operation buffering and timeouts.
async function startServer() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.error('Error while connecting to MongoDB:', err);
    process.exit(1);
  }
}

startServer();