const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.get("Authorization");

  if (!token) {
    const error = new Error("Not authenticated.");
    error.statusCocde = 401;
    throw error;
  }

  const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  if (!decodedToken) {
    const error = new Error("Not Authanticated.");
    error.statusCode = 401;
    throw error;
  }
  // console.log(decodedToken);
  req.userId = decodedToken.id;
  next();
};
