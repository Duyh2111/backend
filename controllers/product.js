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

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.status(200).json(req.product);
};

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
      if (err) {
          return res.status(400).json({
              error: 'Image could not be uploaded'
          });
      }
      let product = new Product(fields);

      if (files.photo) {
          // console.log("FILES PHOTO: ", files.photo);
          if (files.photo.size > 5000000) {
              return res.status(400).json({
                  error: 'Image should be less than 1mb in size'
              });
          }
          product.photo.data = fs.readFileSync(files.photo.path);
          product.photo.contentType = files.photo.type;
      }

      product.save((err, result) => {
          if (err) {
              console.log('PRODUCT CREATE ERROR ', err);
              return res.status(400).json({
                  error: errorHandler(err)
              });
          }
          res.json(result);
      });
  });
};

exports.remove = (req, res) => {
  let product = req.product;
  product.remove((err, d) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.status(200).json({
      status: "OK",
      message: "Product deleted successfully",
    });
  });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Can not upload",
      });
    }

    let product = req.product;
    product = _.extend(product, fields);

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Can not upload. Image less than 1mb",
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.status(200).json({
        message: "Upload successful",
        product,
      });
    });
  });
};

/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;

  Product.find()
    .select("-photo")
    .populate("category", "branch")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, product) => {
      if (err) {
        return res.status(404).json({
          error: "Products not found",
        });
      }
      res.json(product);
    });
};

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */

exports.listCategoriesRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;

  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(product);
    });
};

exports.listBranchRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;

  Product.find({ _id: { $ne: req.product }, branch: req.product.branch })
    .limit(limit)
    .populate("branch", "_id name")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(product);
    });
};

exports.listCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Categories not found",
      });
    }
    res.status(200).json({categories});
  });
};

exports.listBranches = (req, res) => {
  Product.distinct("branch", {}, (err, branches) => {
    if (err) {
      return res.status(400).json({
        error: "Branches not found",
      });
    }
    res.status(200).json(branches);
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

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

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
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json({
        count: data.length,
        data,
      });
    });
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.listSearch = (req, res) => {
  // create query object to hold search value and category value
  const query = {};
  // assign search value to query.name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };
    // assigne category value to query.category
    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }
    // find the product based on query object with 2 properties
    // search and category
    Product.find(query, (err, products) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(products);
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

exports.createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
};
