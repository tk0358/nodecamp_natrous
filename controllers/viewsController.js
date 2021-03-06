const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const Like = require('../models/likeModel');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for confirmation. If your booking doesn't show up here immediately, please come back later.";
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

// exports.canReviewThisTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findOne({ slug: req.params.slug });
//   const booking = await Booking.findOne({
//     tour: tour.id,
//     user: req.user.id,
//   });
//   if (booking && booking.startDate <= Date.now()) {
//     res.locals.canReview = true;
//   }
//   next();
// });

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  // console.log(tour);

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // when user is logged in
  if (req.user) {
    // 2) Can review the tour which user booked and is finished
    const booking = await Booking.findOne({
      tour: tour.id,
      user: req.user.id,
    });
    const review = await Review.findOne({
      tour: tour.id,
      user: req.user.id,
    });
    const like = await Like.findOne({
      tour: tour.id,
      user: req.user.id,
    });

    if (!review && booking && booking.startDate <= Date.now()) {
      res.locals.canReview = true;
    }

    res.locals.canBook = !booking;
    if (like) {
      res.locals.like = like.id;
    }
  }

  // 4) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getEditTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug });

  res.status(200).render('editTour', {
    title: `Edit ${tour.name} Tour`,
    tour,
    id: tour.id,
  });
});

exports.getNewTour = (req, res) => {
  res.status(200).render('newTour', {
    title: 'New Tour',
  });
};

exports.getNewUser = (req, res) => {
  res.status(200).render('newUser', {
    title: 'New User',
  });
};

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSmsForm = (req, res, next) => {
  const { serviceId } = req.query;
  res.status(200).render('sms', {
    title: 'Confirm your SMS code',
    serviceId,
  });
};

exports.getSignupForm = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Sign up to Natours',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  // const tours = await Promise.all(
  //   tourIDs.map(async id => await Tour.findById(id))
  // );
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getMyFavorites = catchAsync(async (req, res, next) => {
  // 1) Find All Likes
  const likes = await Like.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = likes.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Favorites',
    tours,
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id });

  res.status(200).render('myReviews', {
    reviews,
  });
});

exports.getReviewEditForm = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'tour',
    select: 'imageCover name',
  });

  res.status(200).render('reviewEdit', {
    review,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
      photo: req.file.filename,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getManageMenu = (req, res) => {
  res.status(200).render('manage', {
    title: 'Manage Menu',
  });
};

exports.getTourManage = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('tourManage', {
    tours,
    title: 'Tour Manage Page',
  });
});

exports.getUserManage = catchAsync(async (req, res) => {
  const users = await User.find().select('+active').select('+mailConfirm');
  // console.log(users);
  res.status(200).render('userManage', {
    users,
    title: 'User Manage Page',
  });
});

exports.getReviewManage = catchAsync(async (req, res) => {
  const reviews = await Review.find()
    .sort('-createdAt')
    .populate('user', 'name')
    .populate('tour', 'name');
  // デフォルトでは新しい物をチェックしやすいよう最新の物が一番上に来るような順番に

  // console.log(reviews);

  res.status(200).render('reviewManage', {
    reviews,
    title: 'Review Manage Page',
  });
});

exports.getNewReview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  const users = await User.find();
  res.status(200).render('newReview', {
    tours,
    users,
    title: 'New Review',
  });
});

exports.getBookingManage = catchAsync(async (req, res) => {
  const bookings = await Booking.find().sort('-createdAt');
  res.status(200).render('bookingManage', {
    bookings,
    title: 'Booking Manage Page',
  });
});

exports.getNewBooking = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  const users = await User.find();
  res.status(200).render('newBooking', {
    tours,
    users,
    title: 'New Booking',
  });
});
