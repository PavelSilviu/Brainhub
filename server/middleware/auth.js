const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "User not authenticated" });
  } else {
    next();
  }
};

module.exports = authMiddleware;
