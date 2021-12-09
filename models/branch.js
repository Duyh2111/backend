const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 30,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);
