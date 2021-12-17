const User = require("../models/user");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, id) => {
  // find the user by "findById" method and execute the callback function
  User.findById(id).exec((err, user) => {
    // if no user => error; if there is a user => call user req.profile
    if (err || !user) {
      return res.status(404).json({
        error: "User not found!!",
      });
    }
    req.profile = user;
    // this is a middleware => call next
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
    // find the user by id
    { _id: req.profile._id },
    // set the incoming data to request body
    { $set: req.body },
    // set new data to be true
    { new: true },
    (err, update) => {
      if (!err) {
        update.hashed_password = undefined;
        update.salt = undefined;
        res.status(200).json(update);
      } else {
        res.status(401).json({
          error: "Not authorized",
        });
      }
    }
  );
};

exports.addOrderToHistory = (req, res, next) => {
  // Start with an empty history array
  let history = [];
  // using req.body.order.products to get the products and call forEach to loop through each item
  // Get all the products from the order and push it to the history array
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
  // find the user id in the User model and push the history array to this particular User model
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    // create a new history property in the User model schema
    { new: true },
    (err, order) => {
      if (err) {
        return res.status(404).json({
          error: "Could not update",
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
      if (!err) {
        res.status(200).json(orders);
      } else {
        res.status(404).json({ error: errorHandler(err) });
      }
    });
};
