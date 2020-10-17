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
  '/manage',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getManageMenu
);

router.get(
  '/manage/tours',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getTourManage
);

router.get(
  '/tour/new',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getNewTour
);

router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  // viewsController.canReviewThisTour,
  viewsController.getTour
);

router.get(
  '/tour/:slug/edit',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getEditTour
);

router.get(
  '/manage/users',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getUserManage
);

router.get(
  '/user/new',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getNewUser
);

router.get(
  '/manage/reviews',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getReviewManage
);

router.get(
  '/review/new',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getNewReview
);

router.get(
  '/manage/bookings',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getBookingManage
);

router.get(
  '/booking/new',
  authController.isLoggedIn,
  authController.restrictTo('admin'),
  viewsController.getNewBooking
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

router.get(
  '/reviews/:id/edit',
  authController.protect,
  viewsController.getReviewEditForm
);

router.post(
  '/submit-user-data',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  // userController.updateMe
  viewsController.updateUserData
);

module.exports = router;
