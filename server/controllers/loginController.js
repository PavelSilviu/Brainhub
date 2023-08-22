const { adminId } = require("../shared");

exports.login = function (req, res) {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'User login'
  // #swagger.description = 'Endpoint to handle user login.'

  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ error: "Failed to login. Authorization failed" });
  }

  const userId = req.user.id;
  if (userId === adminId) {
    res.setHeader("X-Role", "admin");
  } else {
    res.setHeader("X-Role", "normal");
  }
  res.setHeader("Access-Control-Expose-Headers", "X-Role");
  return res.status(200).json({ message: "Success" });
};
