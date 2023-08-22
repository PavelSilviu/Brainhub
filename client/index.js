const express = require("express");
const app = express();
const path = require("path");
const fontawesomedir = path.join(__dirname, "node_modules", "fontawesome-free");
const imagesDir = path.join(__dirname, "assets", "images");
const cssDir = path.join(__dirname, "assets", "css");
const jsDir = path.join(__dirname, "assets", "js");
const ejs = require("ejs");

//Some settings
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.get("/adminDashboard", (req, res) => {
  res.render("adminDashboard.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/home", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/post/:id", (req, res) => {
  const postId = req.params.id;
  res.render("post.ejs", { postId });
});

app.get("/profile", (req, res) => {
  res.render("profile.ejs");
});

app.get("/admin-profile/:id", (req, res) => {
  const userId = req.params.id;
  res.render("adminProfile.ejs", { userId });
});

app.get("/public-profile/:id", (req, res) => {
  const userId = req.params.id;
  res.render("publicProfile.ejs", { userId });
});

app.get("/edit-posts", (req, res) => {
  res.render("editPosts.ejs");
});

app.get("/admin-edit-posts/:id", (req, res) => {
  const userId = req.params.id;
  res.render("adminEditPosts.ejs", { userId });
});

app.get("/edit-profile", (req, res) => {
  res.render("editProfile.ejs");
});

app.get("/admin-edit-profile/:id", (req, res) => {
  const userId = req.params.id;
  res.render("adminEditProfile.ejs", { userId });
});

app.use("/images", express.static(imagesDir));
app.use("/css", express.static(cssDir));
app.use("/fontawesome", express.static(fontawesomedir));
app.use("/js", express.static(jsDir));

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
