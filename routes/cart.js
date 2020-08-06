const express = require('express');
const router = express.Router();
const Cart = require('./../models/Cart');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const information = {
      user: req.user.googleId,
      note: req.params.id,
    };

    const cartItem = Cart.create(information);

    res.redirect(`/note/${req.params.id}`);
  } catch (err) {
    res.redirect(`/note/${req.params.id}`);
  }
});

router.get('/delete/:id', ensureAuth, async (req, res) => {
  try {
    const cartItem = await Cart.findOne({
      note: req.params.id,
      user: req.user.googleId,
    });

    if (cartItem) {
      await Cart.findByIdAndDelete(cartItem._id);
    }
    res.redirect(`/note/${req.params.id}`);
  } catch (err) {
    res.redirect(`/note/${req.params.id}`);
  }
});

router.get('/', ensureAuth, async (req, res) => {
  const cartItems = await Cart.find({
    user: req.user.googleId,
  }).populate('note');


  res.render('cart', {
    cartItems: cartItems.map((item) => item.toJSON()),
  });
});

module.exports = router;
