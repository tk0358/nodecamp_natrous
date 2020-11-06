/* eslint-disable */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  const { startDate } = req.params;

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}&date=${req.params.startDate}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
    metadata: {
      startDate: startDate,
    },
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { tour, user, price, date } = req.query;

//   if (!tour || !user || !price || !date) return next();
//   const startDate = new Date(Number(date));
//   // console.log(date, startDate);
//   await Booking.create({ tour, user, price, startDate });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

exports.examineDateAndParticipant = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.body.tour);
  const date = new Date(req.body.startDate);
  const index = tour.startDates.findIndex(
    el => el.startDate.getTime() === date.getTime()
  );
  if (index === -1) {
    return next(
      new AppError('startDate should be among startDates of the tour', 400)
    );
  }
  if (tour.startDates[index].soldOut) {
    return next(
      new AppError(
        'Sorry, this day is booked out! Please select another day',
        400
      )
    );
  }
  next();
});

const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))._id;
  const price = session.amount_total / 100;
  const startDate = new Date(Number(session.metadata.startDate));
  await Booking.create({ tour, user, price, startDate });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
