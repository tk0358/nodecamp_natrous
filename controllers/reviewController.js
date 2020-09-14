const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const User = require('../models/userModel');
// const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

exports.restrictToBookingUser = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.body.user });
  const bookingTours = bookings.map(el => el.tour.id);

  if (!bookingTours.includes(req.body.tour)) {
    return next(
      new AppError("You cannnot make review the tour you didn't join", 403)
    );
  }

  next();
});
