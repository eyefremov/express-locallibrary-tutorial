const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

/* GET cool users message. */
router.get('/cool/', (req, res, next) => {
  res.send("You're so cool");
});

module.exports = router;