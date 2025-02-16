const Author = require('../models/author');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

// Display list of all Authors.
exports.author_list = async (req, res, next) => {
  try {
    const allAuthors = await Author.find().sort({ family_name: 1 }).exec();
    res.render('author_list', {
      title: 'Author List',
      author_list: allAuthors,
    });
  } catch (err) {
    next(err);
  }
};

// Display detail page for a specific Author.
exports.author_detail = async (req, res, next) => {
  try {
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, 'title summary').exec(),
    ]);

    if (!author) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }

    res.render('author_detail', {
      title: 'Author Detail',
      author,
      author_books: allBooksByAuthor,
    });
  } catch (err) {
    next(err);
  }
};

// Display Author create form on GET.
exports.author_create_get = (req, res) => {
  res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST.
exports.author_create_post = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified.')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('author_form', {
          title: 'Create Author',
          author,
          errors: errors.array(),
        });
        return;
      }

      // Data from form is valid. Save author.
      await author.save();
      // Redirect to new author record.
      res.redirect(author.url);
    } catch (err) {
      next(err);
    }
  },
];

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  try {
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, 'title summary').exec(),
    ]);

    if (!author) {
      // No results.
      res.redirect('/catalog/authors');
      return;
    }

    res.render('author_delete', {
      title: 'Delete Author',
      author,
      author_books: allBooksByAuthor,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  try {
    const [author, allBooksByAuthor] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, 'title summary').exec(),
    ]);

    if (allBooksByAuthor.length > 0) {
      // Author has books. Render in same way as for GET route.
      res.render('author_delete', {
        title: 'Delete Author',
        author,
        author_books: allBooksByAuthor,
      });
      return;
    }

    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect('/catalog/authors');
  } catch (err) {
    next(err);
  }
};

// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id).exec();

    if (!author) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }

    res.render('author_form', {
      title: 'Update Author',
      author,
    });
  } catch (err) {
    next(err);
  }
};

// Handle Author update on POST.
exports.author_update_post = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified.')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        res.render('author_form', {
          title: 'Update Author',
          author,
          errors: errors.array(),
        });
        return;
      }

      // Data from form is valid. Update the record.
      const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author, {});
      // Redirect to author detail page.
      res.redirect(updatedAuthor.url);
    } catch (err) {
      next(err);
    }
  },
];