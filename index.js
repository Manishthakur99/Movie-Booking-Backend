const express = require('express');
const bodyParser = require('body-parser');
const env = require('dotenv');
const mongoose = require('mongoose');

const MovieRoutes = require('./routes/movie.routes');

env.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MovieRoutes(app);

app.get('/home', (req, res) => {
    console.log('Request received at /home');
    return res.json({
        sucess: true,
        message: 'Welcome to the Movie Booking API'
    });
  
});

app.listen(process.env.PORT, async () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);

  try{
  await mongoose.connect(process.env.DB_URL);
  console.log('Connected to MongoDB');
  // await Movie.create({
  //   name: "The Batman",
  //   description: "The Batman is a 2022 American superhero film based on the DC Comics character Batman. It is directed by Matt Reeves and stars Robert Pattinson as the titular character.",
  //   casts: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano"],
  //   director: "Matt Reeves",
  //   trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
  //   language: "English",
  //   releaseDate: "2022-03-04",
  //   releaseStatus: "RELEASED",
  //   poster: "https://example.com/the-batman-poster.jpg"
  // });
  }catch(err){
    console.error('Error while seeding data:', err);
  }
});