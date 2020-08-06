const path = require('path');
const multer = require('multer');
const Note = require('../models/Notes');

// Set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// init upload

const upload = multer({
  storage: storage,
}).any();

exports.addNewNote = (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (!err) {
        const information = {
          title: req.body.title,
          description: req.body.description,
          price: parseInt(req.body.price, 10),
          author: req.user.googleId,
          filename: req.files[0].filename,
          previewImg: req.files[1].filename
        };

        console.log(information);
        const note = await Note.create(information);

        res.render('upload', {
          message: 'Note created successfully!',
        });
      }
    } catch (err) {
      res.render('upload', {
        message: 'Some fields were empty. Please try again.',
      });
    }
  });
};


exports.getNote = (req, res) => {};
