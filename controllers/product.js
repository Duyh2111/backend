const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category", "branch")
    .exec((err, product) => {
      if (err || !product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

exports.readProduct = (req, res) => {
  req.product.photo = undefined;
  return res.status(200).json(req.product);
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files, price) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    let product = new Product(fields);

    if (files.photo) {
      if (files.photo.size > 5000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, result) => {
      if (!err) {
        res.status(200).json({
          message: "Product deleted successfully",
          result,
        });
      } else {
        res.status(400).json({
          error: errorHandler(err),
        });
      }
    });
  });
};

exports.removeProduct = (req, res) => {
  let product = req.product;
  product.remove((err, d) => {
    if (!err) {
      res.status(200).json({
        status: "OK",
        message: "Product deleted successfully",
      });
    } else {
      res.status(400).json({
        error: errorHandler(err),
      });
    }
  });
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    let product = req.product;
    product = _.extend(product, fields);

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, result) => {
      if (!err) {
        res.json({ message: "Successfully", result });
      } else {
        res.status(400).json({
          error: errorHandler(err),
        });
      }
    });
  });
};

/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.listAllProducts = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;

  Product.find()
    .select("-photo")
    .populate("category", "branch")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, product) => {
      if (!err) {
        res.status(200).json(product);
      } else {
        res.status(404).json({
          error: "Products not found",
        });
      }
    });
};

exports.listCategoriesRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;

  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, product) => {
      if (!err) {
        res.status(200).json(product);
      } else {
        res.status(400).json({
          error: "Products not found",
        });
      }
    });
};

exports.listBranchRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;

  Product.find({ _id: { $ne: req.product }, branch: req.product.branch })
    .limit(limit)
    .populate("branch", "_id name")
    .exec((err, product) => {
      if (!err) {
        res.status(200).json(product);
      } else {
        res.status(400).json({
          error: "Branch not found",
        });
      }
    });
};

exports.listAllCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (!err) {
      res.status(200).json({
        message: "Successfully",
        categories,
      });
    } else {
      res.status(404).json({
        error: "Failure",
      });
    }
  });
};

exports.listAllBranches = (req, res) => {
  Product.distinct("branch", {}, (err, branches) => {
    if (!err) {
      res.status(200).json({ branches });
    } else {
      res.status(404).json({ error: "Failure" });
    }
  });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select("-photo")
    .populate("category", "branch")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (!err) {
        res.json({
          count: data.length,
          data,
        });
      } else {
        res.status(400).json({
          error: "Products not found",
        });
      }
    });
};

exports.photoProduct = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.productListSearch = (req, res) => {
  // create query object to hold search value and category value
  const query = {};
  // assign search value to query.name
  if (req.query.searchProduct) {
    query.name = { $regex: req.query.searchProduct, $options: "i" };
    // assigne category value to query.category
    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }
    // find the product based on query object with 2 properties
    // search and category
    Product.find(query, (err, products) => {
      if (!err) {
        return res.status(200).json(products);
      } else {
        res.status(404).json({
          error: errorHandler(err),
        });
      }
    }).select("-photo");
  }
};

exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { countInStock: -item.count, sold: +item.count } },
      },
    };
  });

  Product.bulkWrite(bulkOps, {}, (error, products) => {
    if (error) {
      return res.status(400).json({
        error: "Could not update product",
      });
    }
    next();
  });
};
