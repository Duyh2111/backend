const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req, res, next, id) => {
  // find the product in the Product model using the findById() method
  Product.findById(id)
    .populate("category", "branch")
    .exec((err, product) => {
      if (err || !product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }
      // if a product is found, set the product info to product
      req.product = product;
      next();
    });
};

exports.readProduct = (req, res) => {
  req.product.photo = undefined;
  // sends back a json response of req.product
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
    // checks for image size less than 5mb
    // if greater than 5mb, return error
    if (files.photo) {
      if (files.photo.size > 5000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }
    // save the product, if error => response with error message
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
  // Get the product from req.product
  // call a remove function to delete the product
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
    // get the product from req.product
    // using the extend() method from the lodash library to update product with new fields
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
  // lists all the products based on the request query params
  let order = req.query.order ? req.query.order : "asc"; // "an ascending sort" => values are sorted in A to Z order
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  // Use the limit param from the request query, if given. Else set a default value param
  let limit = req.query.limit ? parseInt(req.query.limit) : 20;

  Product.find()
    .select("-photo")
    // call populate() method to populate the category property
    .populate("category", "branch")
    // call sort() method to sort products by 'sortBy' and 'order'
    .sort([[sortBy, order]])
    // set the number of products returned
    .limit(limit)
    // execute the callback function
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
  //  find all the products in the category based on the product id
  // EXCEPT the requested product itself
  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    // set the number of products returned
    .limit(limit)
    // call populate() method to populate the category property
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
  // distinct() method to get the 'category' that is used on product model
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
  // // distinct() method to get the 'branch' that is used on product model
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
  // define the order, sortBy, limit, skip, and findArgs. Use the params from
  // the request query if they are given
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};
  console.log(req.body.filters);
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
  // find products based on the findArgs object
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
  // Check to see if photo exists in req.product
  if (req.product.photo.data) {
    // set the content-type of req.product and send the product photo
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.productListSearch = (req, res) => {
  // create query object to hold search value and category value
  const query = {};
  // assign search value to query.name
  console.log(req.query.search);
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" }; // "i" both lower case and upper case in string
    // assign category value to query.category
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
          message: err.message,
        });
      }
    }).select("-photo");
  }
};

exports.decreaseQuantity = (req, res, next) => {
  // get the products from order  and use map() to loops through the products array
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
