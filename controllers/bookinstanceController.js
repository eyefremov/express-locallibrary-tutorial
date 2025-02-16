const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = async (req, res, next) => {
  try {
    const allBookInstances = await BookInstance.find().populate('book').exec();

    res.render('bookinstance_list', {
      title: 'Book Instance List',
      bookinstance_list: allBookInstances,
    });
  } catch (err) {
    next(err);
  }
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res, next) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id)
      .populate('book')
      .exec();

    if (!bookInstance) {
      // No results.
      const err = new Error('Book copy not found');
      err.status = 404;
      return next(err);
    }

    res.render('bookinstance_detail', {
      title: 'Book:',
      bookinstance: bookInstance,
    });
  } catch (err) {
    next(err);
  }
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
  try {
    const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();

    res.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: allBooks,
    });
  } catch (err) {
    next(err);
  }
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // Create a BookInstance object with escaped and trimmed data.
      const bookInstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values and error messages.
        const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();

        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: allBooks,
          selected_book: bookInstance.book,
          errors: errors.array(),
          bookinstance: bookInstance,
        });
        return;
      }

      // Data from form is valid. Save book instance.
      await bookInstance.save();
      res.redirect(bookInstance.url);
    } catch (err) {
      next(err);
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id).exec();

    if (!bookInstance) {
      // No results.
      res.redirect('/catalog/bookinstances');
      return;
    }

    res.render('bookinstance_delete', {
      title: 'Delete Book Instance',
      bookinstance: bookInstance,
    });
  } catch (err) {
    next(err);
  }
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
  try {
    await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
    res.redirect('/catalog/bookinstances');
  } catch (err) {
    next(err);
  }
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  try {
    // Fetch the BookInstance and populate its `book` field
    // Also fetch all Books to list them in the <select>
    const [bookInstance, allBooks] = await Promise.all([
      BookInstance.findById(req.params.id).populate('book').exec(),
      Book.find({}, 'title').sort({ title: 1 }).exec(),
    ]);

    if (!bookInstance) {
      const err = new Error('BookInstance not found');
      err.status = 404;
      return next(err);
    }

    res.render('bookinstance_form', {
      title: 'Update Book Instance',
      bookInstance,
      book_list: allBooks,
      // We'll use `selected_book` in the pug template to mark the correct book as selected
      selected_book: bookInstance.book ? bookInstance.book._id.toString() : null,
    });
  } catch (err) {
    next(err);
  }
};


// Handle BookInstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body('imprint', 'Imprint must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status', 'Status must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // Create a BookInstance object with the old ID
      const bookInstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id,
      });

      if (!errors.isEmpty()) {
        // If there are errors, fetch the list of books again
        const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();

        res.render('bookinstance_form', {
          title: 'Update Book Instance',
          bookInstance,
          book_list: allBooks,
          selected_book: bookInstance.book.toString(),
          errors: errors.array(),
        });
        return;
      }

      // If no errors, update in the database
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookInstance,
        {}
      );
      res.redirect(updatedBookInstance.url);
    } catch (err) {
      next(err);
    }
  },
];