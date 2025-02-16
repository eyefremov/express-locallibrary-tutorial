const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const { body, validationResult } = require('express-validator');

// Display the home page.
exports.index = async (req, res, next) => {
  try {
    // Get details of books, book instances, authors, and genre counts (in parallel)
    const [
      numBooks,
      numBookInstances,
      numAvailableBookInstances,
      numAuthors,
      numGenres,
    ] = await Promise.all([
      Book.countDocuments({}).exec(),
      BookInstance.countDocuments({}).exec(),
      BookInstance.countDocuments({ status: 'Available' }).exec(),
      Author.countDocuments({}).exec(),
      Genre.countDocuments({}).exec(),
    ]);

    res.render('index', {
      title: 'Local Library Home',
      book_count: numBooks,
      book_instance_count: numBookInstances,
      book_instance_available_count: numAvailableBookInstances,
      author_count: numAuthors,
      genre_count: numGenres,
    });
  } catch (err) {
    next(err);
  }
};

// Display list of all books.
exports.book_list = async (req, res, next) => {
  try {
    const allBooks = await Book.find({}, 'title author')
      .sort({ title: 1 })
      .populate('author')
      .exec();

    res.render('book_list', { title: 'Book List', book_list: allBooks });
  } catch (err) {
    next(err);
  }
};

// Display detail page for a specific book.
exports.book_detail = async (req, res, next) => {
  try {
    // Get details of books and book instances for a specific book
    const [book, bookInstances] = await Promise.all([
      Book.findById(req.params.id).populate('author').populate('genre').exec(),
      BookInstance.find({ book: req.params.id }).exec(),
    ]);

    if (!book) {
      // No results.
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }

    res.render('book_detail', {
      title: book.title,
      book,
      book_instances: bookInstances,
    });
  } catch (err) {
    next(err);
  }
};

// Display book create form on GET.
exports.book_create_get = async (req, res, next) => {
  try {
    // Get all authors and genres for the form
    const [allAuthors, allGenres] = await Promise.all([
      Author.find().sort({ family_name: 1 }).exec(),
      Genre.find().sort({ name: 1 }).exec(),
    ]);

    res.render('book_form', {
      title: 'Create Book',
      authors: allAuthors,
      genres: allGenres,
    });
  } catch (err) {
    next(err);
  }
};

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('author', 'Author must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // Create a Book object with escaped and trimmed data
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors and genres for the form
        const [allAuthors, allGenres] = await Promise.all([
          Author.find().sort({ family_name: 1 }).exec(),
          Genre.find().sort({ name: 1 }).exec(),
        ]);

        // Mark selected genres as checked
        allGenres.forEach((genre) => {
          if (book.genre.includes(genre._id)) genre.checked = 'true';
        });

        res.render('book_form', {
          title: 'Create Book',
          authors: allAuthors,
          genres: allGenres,
          book,
          errors: errors.array(),
        });
        return;
      }

      // Data from form is valid. Save book.
      await book.save();
      res.redirect(book.url);
    } catch (err) {
      next(err);
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = async (req, res, next) => {
  try {
    // Get details of book and all its book instances
    const [book, allBookInstances] = await Promise.all([
      Book.findById(req.params.id).exec(),
      BookInstance.find({ book: req.params.id }).exec(),
    ]);

    if (!book) {
      // No results.
      res.redirect('/catalog/books');
      return;
    }

    res.render('book_delete', {
      title: 'Delete Book',
      book,
      book_instances: allBookInstances,
    });
  } catch (err) {
    next(err);
  }
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  try {
    // Get details of book and all its book instances
    const [book, allBookInstances] = await Promise.all([
      Book.findById(req.params.id).exec(),
      BookInstance.find({ book: req.params.id }).exec(),
    ]);

    if (allBookInstances.length > 0) {
      // Book has book instances. Render in the same way as for GET route.
      res.render('book_delete', {
        title: 'Delete Book',
        book,
        book_instances: allBookInstances,
      });
      return;
    }

    // Book has no book instances. Delete object and redirect to the list of books.
    await Book.findByIdAndDelete(req.body.bookid);
    res.redirect('/catalog/books');
  } catch (err) {
    next(err);
  }
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  try {
    // Get book, authors, and genres for the form
    const [book, allAuthors, allGenres] = await Promise.all([
      Book.findById(req.params.id).populate('author').exec(),
      Author.find().sort({ family_name: 1 }).exec(),
      Genre.find().sort({ name: 1 }).exec(),
    ]);

    if (!book) {
      // No results.
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }

    // Mark selected genres as checked
    allGenres.forEach((genre) => {
      if (book.genre.includes(genre._id)) genre.checked = 'true';
    });

    res.render('book_form', {
      title: 'Update Book',
      authors: allAuthors,
      genres: allGenres,
      book,
    });
  } catch (err) {
    next(err);
  }
};

// Handle book update on POST.
exports.book_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('author', 'Author must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      // Create a Book object with escaped/trimmed data and old ID
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
        _id: req.params.id, // Required to prevent a new ID from being assigned
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.

        // Get all authors and genres for the form
        const [allAuthors, allGenres] = await Promise.all([
          Author.find().sort({ family_name: 1 }).exec(),
          Genre.find().sort({ name: 1 }).exec(),
        ]);

        // Mark selected genres as checked
        allGenres.forEach((genre) => {
          if (book.genre.includes(genre._id)) genre.checked = 'true';
        });

        res.render('book_form', {
          title: 'Update Book',
          authors: allAuthors,
          genres: allGenres,
          book,
          errors: errors.array(),
        });
        return;
      }

      // Data from form is valid. Update the record.
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {});
      // Redirect to book detail page.
      res.redirect(updatedBook.url);
    } catch (err) {
      next(err);
    }
  },
];
  
