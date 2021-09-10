const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    comment: {
      type: String,
      maxlength: 10000,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 10,
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: true,
    },
    // branch: {
    //     type: ObjectId,
    //     ref: "Branch",
    //     required: true,
    //   },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    shipping: {
      required: false,
      type: Boolean,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
      },
      numReviews: {
        type: Number,
        required: true,
        default: 0,
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
