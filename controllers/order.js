const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.orderById = (req, res, next, id) => {
  Order.findById(id)
    .populate("products.product", "name price")
    .exec((err, order) => {
      if (err || !order) {
        return res.status(404).json({
          error: errorHandler(err),
        });
      }
      req.order = order;
      next();
    });
};

exports.create = (req, res) => {
  // get the user from the frontend and assign it to the value req.profile
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  order.save((error, data) => {
    if (!error) {
      return res.status(200).json(data);
    } else {
      res.status(404).json({
        error: errorHandler(error),
      });
    }
  });
};

exports.listOrders = (req, res) => {
  Order.find()
    .populate("user", "_id name address")
    .sort("-created")
    .exec((err, orders) => {
      if (!err) {
        return res.status(200).json(orders);
      } else {
        res.status(404).json({
          error: errorHandler(error),
        });
      }
    });
};

exports.getStatus = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatus = (req, res) => {
  Order.update(
    { _id: req.body.orderId },
    { $set: { status: req.body.status } },
    (err, order) => {
      if (order) {
        return res.status(200).json(order);
      } else {
        res.status(400).json({
          error: errorHandler(err),
        });
      }
    }
  );
};
