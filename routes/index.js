var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.use('/api/devices', require('./post.routes'));
router.use('/raid', require('./raid.routes'));

module.exports = router;