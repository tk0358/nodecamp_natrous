const mongoose = require('mongoose');
const Tour = require('./tourModel');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  startDate: {
    type: Date,
    required: [true, 'Booking must have a startDate'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Beooking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

bookingSchema.post('save', async function (doc, next) {
  // 1) find the index of the target date
  const tour = await Tour.findById(doc.tour);
  const index = tour.startDates.findIndex(
    el => el.startDate.getTime() === doc.startDate.getTime()
  );

  // 2) participant
  const { startDates } = tour;
  startDates[index].participant += 1;

  // 3) compare participant with maxGroupSize
  if (startDates[index].participant === tour.maxGroupSize) {
    startDates[index].soldOut = true;
  }

  // 4) update startDates of the tour
  await Tour.findByIdAndUpdate(tour.id, {
    startDates,
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
