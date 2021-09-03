const Branch = require("../models/branch");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.branchById = (req, res, next, id) => {
    branch.findById(id).exec((err, branch) => {
        if (err || !branch) {
            return res.status(400).json({
                error: "Branch does not exist"
            });
        }
        req.branch = branch;
        next();
    });
};

exports.create = (req, res) => {
    const branch = new Branch(req.body);
    branch.save((err, branch) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.status(200).json({ branch });
    });
};

exports.read = (req, res) => {
    return res.json(req.branch);
};

exports.update = (req, res) => {
    const branch = req.branch;
    branch.name = req.body.name;
    branch.save((err, branch) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.status(200).json(branch);
    });
};

exports.remove = (req, res) => {
    const branch = req.branch;
    branch.remove((err, branch) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Branch deleted"
        });
    });
};

exports.list = (req, res) => {
  Branch.find().exec((err, branch) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(branch);
    });
};
