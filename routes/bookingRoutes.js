const express = require('express');
const bookingController = require('../controllers/bookingController');
// const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get(
  '/checkout-session/:tourId/:startDate',
  bookingController.getCheckoutSession
);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(
    bookingController.examineDateAndParticipant,
    bookingController.createBooking
  );

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
