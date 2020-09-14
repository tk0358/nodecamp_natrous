const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);

router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  // viewsController.canReviewThisTour,
  viewsController.getTour
);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get(
  '/my-favorites',
  authController.protect,
  viewsController.getMyFavorites
);
router.get('/my-reviews', authController.protect, viewsController.getMyReviews);

router.post(
  '/submit-user-data',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  // userController.updateMe
  viewsController.updateUserData
);

module.exports = router;
