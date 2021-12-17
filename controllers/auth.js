const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  // console.log("req.body", req.body);
  // create a new user and save user into database
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: errorHandler(err),
      });
    }
    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({
      user,
    });
  });
};

exports.signin = (req, res) => {
  // takes the user email and password from the request
  const { email, password } = req.body;
  // find the user by email
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "Email is not exist",
      });
    }
    // use the authenticate method from user model to check the email and password match
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Password is not correct",
      });
    }
    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // persist the token as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return response with user and token to frontend client in json format
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};

exports.signout = (req, res) => {
  // clears the token that is stored in the cookie
  res.clearCookie("t");
  res.status(200).json({ message: "Signout successfully" });
};

exports.requireSignin = expressJwt({
  // restricts unauthorized user access
  secret: process.env.JWT_SECRET,
  algorithms: ["sha1", "RS256", "HS256"],
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  // The authenticated_id must match the profile_id;
  // If not match, can not access the profile
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access denied",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  // make sure admin role === 1;
  // if != It's user
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Admin resourse!",
    });
  }
  next();
};
