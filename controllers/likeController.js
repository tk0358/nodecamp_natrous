const Like = require('../models/likeModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createLike = factory.createOne(Like);
exports.deleteLike = factory.deleteOne(Like);
exports.getAllLikes = factory.getAll(Like);
