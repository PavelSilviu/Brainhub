const express = require("express");
const passport = require("passport");
const app = express();
const GitHubStrategy = require("passport-github2").Strategy;
const db = require("./models");
const session = require("express-session");
require("dotenv").config();
const path = require("path");
const uploadsDir = path.join(__dirname, "uploads");
const levelImagesDir = path.join(__dirname, "assets/images/levels");
const cors = require("cors");
const { clientUrl, serverPort, serverUrl } = require("./shared");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const axios = require("axios");
const fs = require("fs");

// swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./autogen.json");

//socket.io
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

//Some settings
app.use(express.json({ limit: "50mb" }));
const corsOptions = {
  origin: clientUrl,
  credentials: true,
  exposedHeaders: ["Location"],
};
app.use(cors(corsOptions));

//Sessions middlewares
//session of express-session
app.use(
  session({
    secret: "keyboard cat", //used to sign the session ID cookie, which is sent to the client
    resave: false,
    sameSite: "none",
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session()); // = express-session + persistenta prin db, to store a unique identifier for the user in the session
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});
passport.deserializeUser(async function (id, cb) {
  try {
    const user = await db.User.findByPk(id);
    return cb(null, user);
  } catch (error) {
    return cb(error);
  }
});

//Auth
function storeToken(userId, token) {
  const tokensPath = "accessTokens.json";

  let tokens = {};
  if (fs.existsSync(tokensPath)) {
    const tokensFile = fs.readFileSync(tokensPath, "utf8");
    tokens = JSON.parse(tokensFile);
  }
  tokens[userId] = token;
  fs.writeFileSync(tokensPath, JSON.stringify(tokens));
  console.log(`Token stored successfully for user ${userId}!`);
}
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: serverUrl + "/auth/github/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const [user, created] = await db.User.findOrCreate({
          where: { id: profile.id },
          defaults: {
            firstName: profile.username,
            lastName: profile.username,
            email: profile.username,
            password: await bcrypt.hash("123", 10),
            github: profile.profileUrl,
            photo: profile.photos[0].value,
          },
        });

        if (created) {
          const photoUrl = profile.photos[0].value;
          const imageName = `${Date.now()}-${profile.id}.png`;
          const imagePath = path.join(
            __dirname,
            "./uploads/profilePictures",
            imageName
          );

          const response = await axios.get(photoUrl, {
            responseType: "arraybuffer",
          });
          fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

          user.photo = imageName;
          await user.save();

          // adding level
          const defaultLevel = await db.Level.findOne({
            where: { id: 1 },
          });

          if (!defaultLevel) {
            done({ error: "Cannot give level to user" });
            return;
          }
          await db.UserLevel.create({
            UserId: user.id,
            LevelId: defaultLevel.id,
          });
        }

        storeToken(user.id, accessToken);
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async function (email, password, done) {
      try {
        const user = await db.User.findOne({ where: { email: email } });
        console.log("passs:", password);
        console.log("email:", email);
        if (!user) {
          console.log("aici 1");
          return done(null, false, { message: "User Doesn't Exist" });
        }

        const dbPassword = user.password;
        const match = await bcrypt.compare(password, dbPassword);

        if (!match) {
          console.log("aici2");
          return done(null, false, {
            message: "Wrong Username and Password Combination!",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

app.get(
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'GitHub Authentication'
  // #swagger.description = 'Initiates the GitHub authentication process.'
  "/auth/github",
  passport.authenticate("github", { scope: ["read:user", "user:email"] }),
  function (req, res) {
    res.status(307).json({ message: "Redirected to Guthub login page" });
  }
);

app.get(
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'GitHub Authentication Callback'
  // #swagger.description = 'Callback endpoint for GitHub authentication process.'
  "/auth/github/callback",
  passport.authenticate("github"),
  function (req, res) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    res.status(200).redirect(clientUrl + "/home");
  }
);

//Swagger
app.use(
  "/views/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { operationsSorter: "method" })
);

//Routerss
const loginRouter = require("./routes/Login");
app.use("/login", loginRouter);
const logoutRouter = require("./routes/Logout");
app.use("/logout", logoutRouter);
const postRouter = require("./routes/Posts");
app.use("/posts/", postRouter);
const userRouter = require("./routes/User");
app.use("/users", userRouter);

app.use("/uploads", express.static(uploadsDir));
app.use("/level-images", express.static(levelImagesDir));

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log("join " + userId);
  });
  socket.on("notification", (msg) => {
    io.to(msg.userId).emit("notification", msg.message);
    console.log(`mesaj: ${msg.message} de la: ${msg.userId}`);
  });
});
//Starting server
db.sequelize.sync().then((req) => {
  server.listen(serverPort, () => {
    console.log("Server running at port 5000");
  });
});
