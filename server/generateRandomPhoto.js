const fs = require("fs");
const path = require("path");

function generateRandomPhoto() {
  const randomImage = fs.readFileSync(
    path.join(__dirname, "assets/images/levels", "Algorithm Master.png")
  );
  const base64Image = Buffer.from(randomImage).toString("base64");
  return base64Image;
}

module.exports = generateRandomPhoto;
