const User = require("../models/user");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.status(200).json(req.profile);
};

exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, u) => {
      if (err) {
        return res.status(401).json({
          error: "You are not authorized",
        });
      }
      u.hashed_password = undefined;
      u.salt = undefined;
      res.status(200).json(u);
    }
  );
};

exports.addOrderToHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach((i) => {
    history.push({
      _id: i._id,
      name: i.name,
      description: i.description,
      category: i.category,
      countInStock: i.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, order) => {
      if (error) {
        return res.status(404).json({
          error: "Could not update user purchase history",
        });
      }
      next();
    }
  );
};

exports.history = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(404).json({
          error: errorHandler(err),
        });
      }
      res.status(200).json(orders);
    });
};
