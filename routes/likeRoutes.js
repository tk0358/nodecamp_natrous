const express = require('express');

const authControlelr = require('../controllers/authController');
const likeController = require('../controllers/likeController');

const router = express.Router({ mergeParams: true });

router.use(authControlelr.protect, authControlelr.restrictTo('user'));

router
  .route('/')
  .post(likeController.setTourUserIds, likeController.createLike)
  .get(likeController.getAllLikes);
router.delete('/:id', likeController.deleteLike);

module.exports = router;
