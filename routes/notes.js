const express = require('express');
const { ensureAuth } = require('../middleware/auth');
const { addNewNote, getNote } = require('./../controllers/noteControllers');
const Note = require('./../models/Notes');
const Cart = require('./../models/Cart');
const Review = require('./../models/Review');
const Purchase = require('./../models/Purchase')
const { route } = require('.');
const User = require('../models/User');

const router = express.Router();

// routes for rendering views

router.get('/add', ensureAuth, (req, res) => {
  res.render('upload');
});

// routes for all notes
router.get('/', ensureAuth, async (req, res) => {
  const notes = await Note.find({});

  res.render('notes', {
    notes: notes.map((note) => note.toJSON()),
  });
});

// routes for one note

router.get('/:id', ensureAuth, async (req, res) => {


  // looks for the note and populate reviews
  let note = (
    await Note.findById(req.params.id).populate('reviews')
  ).toObject();

  // looks for all the reviews of the note and adds author name
  note.reviews.forEach(async (element) => {
    const user = await User.findById(element.user);
    element.authorName = `${user.firstName} ${user.lastName}`;
  });

  // looks whether the user has added the note to cart
  const cartItem = await Cart.findOne({
    user: req.user.googleId,
    note: req.params.id,
  });

  note.addedToCart = false
  if (cartItem) note.addedToCart = true;

  // looks whether the user has reviewed the note or not

  const user = await User.findOne({ googleId: req.user.googleId });
  const myReview = await Review.findOne({
    user: user._id,
    note: req.params.id,
  });

  note.hasReviewed = false;
  if(myReview)
    note.hasReviewed = true;


  // looks whether the user has purchased the note
     
  const purchase = await Purchase.findOne({

       user: req.user.googleId,
       note: req.params.id
  })

  note.hasPurchased = false;
  if(purchase)
    note.hasPurchased = true;

  res.render('note', note);
});

router.get('/buy/:id',ensureAuth ,(req, res) => {
  
   
  const message = req.query.message || "";

  res.render('payment', {

    message: message,
    productID: req.params.id
  });
});

// route for downloading note

router.get('/download/:id',ensureAuth,async function(req, res){

  const note = await Note.findById(req.params.id);

  const filename = 'note.pdf'
  const file = `${__dirname}/../public/uploads/${note.filename}`;
  res.download(file, filename); // Set disposition and send it.
});



// routes for API
router.post('/api/', ensureAuth, addNewNote);
router.get('/api/:id', ensureAuth, getNote);

module.exports = router;
