const express = require('express');
const bodyParser = require('body-parser');
const env = require('dotenv');
const mongoose = require('mongoose');

env.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/home', (req, res) => {
    console.log('Request received at /home');
    return res.json({
        sucess: true,
        message: 'Welcome to the Movie Booking API'
    });
  
});

app.listen(process.env.PORT, async () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
  await mongoose.connect(process.env.DB_URL);
  console.log('Connected to MongoDB');
});