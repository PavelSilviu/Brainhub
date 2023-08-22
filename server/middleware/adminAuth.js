const { adminId } = require("../shared");
const fs = require("fs");

const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "User is not authenticated" });
  } else if (req.user.id !== adminId) {
    const banId = req.user.id;
    try {
      let existingData = "";
      if (fs.existsSync("closeToGetBanned.txt")) {
        existingData = fs.readFileSync("closeToGetBanned.txt", "utf8");
      }
      existingData += banId + "\n";
      fs.writeFileSync("closeToGetBanned.txt", existingData);
    } catch (error) {
      console.error(error);
    }
    return res.status(401).json({
      error: "You don't have admin rights.",
    });
  } else {
    next();
  }
};

module.exports = authMiddleware;
