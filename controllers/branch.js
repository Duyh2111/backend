const Branch = require("../models/branch");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.branchById = (req, res, next, id) => {
  Branch.findById(id).exec((err, branch) => {
    if (err || !branch) {
      return res.status(404).json({
        error: "Branch does not exist",
      });
    }
    req.branch = branch;
    next();
  });
};

exports.create = (req, res) => {
  const branch = new Branch(req.body);
  branch.save((err, data) => {
    if (!err) {
      res.status(200).json({ message: "Branch is created", data });
    } else {
      res.status(400).json({ error: errorHandler(err) });
    }
  });
};

exports.read = (req, res) => {
  return res.status(200).json(req.branch);
};

exports.update = (req, res) => {
  const branch = req.branch;
  branch.name = req.body.name;
  branch.save((err, branch) => {
    if (!err) {
      res.status(200).json({ message: "successfully", branch });
    } else {
      res.status(404).json({
        error: errorHandler(err),
      });
    }
  });
};

exports.remove = (req, res) => {
  const branch = req.branch;
  Product.find({ branch }).exec((err, data) => {
    if (data.length >= 1) {
      return res.status(404).json({
        message: `Sorry. ${branch.name} has been assigned.`,
      });
    } else {
      branch.remove((err, data) => {
        if (!err) {
          res.json({
            message: "Branch deleted",
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
  Branch.find().exec((err, data) => {
    if (!err) {
      res.status(200).json(data);
    } else {
      res.status(400).json({ error: errorHandler(err) });
    }
  });
};
