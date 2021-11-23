const Category = require("../models/category");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.categoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(404).json({
        error: "Category does not exist",
      });
    }
    req.category = category;
    next();
  });
};

exports.create = (req, res) => {
  const category = new Category(req.body);
  category.save((err, data) => {
    if (!err) {
      res.status(200).json({ message: "Category is created", data });
    } else {
      res.status(400).json({ error: errorHandler(err) });
    }
  });
};

exports.read = (req, res) => {
  return res.status(200).json(req.category);
};

exports.update = (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  category.save((err, category) => {
    if (!err) {
      res.status(200).json({ message: "successfully", category });
    } else {
      res.status(404).json({
        error: errorHandler(err),
      });
    }
  });
};

exports.remove = (req, res) => {
  const category = req.category;
  Product.find({ category }).exec((err, data) => {
    if (data.length >= 1) {
      return res.status(404).json({
        message: `Sorry. ${category.name} has been assigned.`,
      });
    } else {
      category.remove((err, data) => {
        if (!err) {
          res.json({
            message: "Category deleted",
          });
        } else {
          return res.status(404).json({
            error: errorHandler(err),
          });
        }
      });
    }
  });
};

exports.list = (req, res) => {
  Category.find().exec((err, data) => {
    if (!err) {
      res.status(200).json(data);
    } else {
      res.status(400).json({ error: errorHandler(err) });
    }
  });
};
