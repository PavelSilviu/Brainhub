exports.logout = function (req, res, next) {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'User logout'
  // #swagger.description = 'Endpoint to handle user logout.'
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.clearCookie("connect.sid"); // clear the session cookie
      res.status(200).json({ message: "Succes" });
    });
  });
};
