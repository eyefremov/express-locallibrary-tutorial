const { body, validationResult } = require('express-validator');
const Genre = require('../models/genre');
const Book = require('../models/book');

// Display list of all Genres.
exports.genre_list = async (req, res, next) => {
  try {
    const allGenres = await Genre.find().sort({ name: 1 }).exec();
    return res.render('genre_list', {
      title: 'Genre List',
      genre_list: allGenres,
    });
  } catch (err) {
    return next(err);
  }
};

// Display detail page for a specific Genre.
exports.genre_detail = async (req, res, next) => {
  try {
    // Get details of genre and all associated books in parallel
    const [genre, booksInGenre] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }, 'title summary').exec(),
    ]);

    if (!genre) {
      const error = new Error('Genre not found');
      error.status = 404;
      return next(error);
    }

    return res.render('genre_detail', {
      title: 'Genre Detail',
      genre,
      genre_books: booksInGenre,
    });
  } catch (err) {
    return next(err);
  }
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // Create a genre object with escaped/trimmed data.
      const genre = new Genre({ name: req.body.name });

      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        return res.render('genre_form', {
          title: 'Create Genre',
          genre,
          errors: errors.array(),
        });
      }

      // Data from form is valid.
      // Check if Genre with the same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: 'en', strength: 2 })
        .exec();

      if (genreExists) {
        // Genre exists; redirect to its detail page.
        return res.redirect(genreExists.url);
      }

      await genre.save();
      // New genre saved. Redirect to genre detail page.
      return res.redirect(genre.url);
    } catch (err) {
      return next(err);
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = async (req, res, next) => {
  try {
    // Get details of genre and all its books in parallel
    const [genre, allBooksByGenre] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }).exec(),
    ]);

    if (!genre) {
      // No results.
      return res.redirect('/catalog/genres');
    }

    return res.render('genre_delete', {
      title: 'Delete Genre',
      genre,
      genre_books: allBooksByGenre,
    });
  } catch (err) {
    return next(err);
  }
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res, next) => {
  try {
    const [genre, allBooksByGenre] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }).exec(),
    ]);

    if (allBooksByGenre.length > 0) {
      // Genre has books. Render in the same way as for GET.
      return res.render('genre_delete', {
        title: 'Delete Genre',
        genre,
        genre_books: allBooksByGenre,
      });
    }

    // Genre has no books. Delete object and redirect to the list of genres.
    await Genre.findByIdAndDelete(req.body.genreid);
    return res.redirect('/catalog/genres');
  } catch (err) {
    return next(err);
  }
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id).exec();

    if (!genre) {
      const error = new Error('Genre not found');
      error.status = 404;
      return next(error);
    }

    return res.render('genre_form', {
      title: 'Update Genre',
      genre,
    });
  } catch (err) {
    return next(err);
  }
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validate and sanitize fields.
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // Create a Genre object with the old ID.
      const genre = new Genre({
        name: req.body.name,
        _id: req.params.id, // Required to prevent a new ID from being assigned
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        return res.render('genre_form', {
          title: 'Update Genre',
          genre,
          errors: errors.array(),
        });
      }

      // Data from form is valid. Update the record.
      const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, {});
      return res.redirect(updatedGenre.url);
    } catch (err) {
      return next(err);
    }
  },
];
