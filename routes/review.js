const express = require('express');
const { ensureAuth } = require('../middleware/auth');
const { addNewNote, getNote } = require('./../controllers/noteControllers');
const Note = require('./../models/Notes');
const Review = require('./../models/Review');
const User = require('./../models/User')

const router = express.Router();

router.post('/add', ensureAuth, async (req, res) => {


  const user = await User.findOne({googleId: req.user.googleId});


  const information = {
    user: user._id,
    note: req.body.noteId,
    rating: req.body.rating,
    title: req.body.title,
    description: req.body.description,
  };

  console.log(information)

  const review = await Review.create(information);

  const note = await Note.findById(req.body.noteId);

  console.log(note)

  note.reviews.push(review._id);

 
  note.ratingsAverage = (note.ratingsAverage * note.ratingsNumber + review.rating ) / (note.ratingsNumber + 1)
  note.ratingsNumber++;

  note.save();

 // console.log(information);

  res.redirect(`/note/${req.body.noteId}`)
});


module.exports = router;
