const {
  Post,
  User,
  Like,
  Comment,
  Follow,
  Notification,
  Action,
  UserAction,
  Level,
  UserLevel,
} = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const moment = require("moment");
const { getAccessTokenByUserId, adminId } = require("../shared");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { faker } = require("@faker-js/faker");
const { sequelize } = require("../models");
//Github Integration
const { Octokit } = require("@octokit/rest");

exports.createProfile = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create a user profile'
  // #swagger.description = 'Endpoint to create a user profile and give him a level.'
  const { firstName, lastName, email, password, github, photo } = req.body;
  if (!firstName || !lastName || !email || !password || !github || !photo) {
    console.log("create profile data send:", req.body);
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const ext = photo.substring(photo.indexOf("/") + 1, photo.indexOf(";"));
    const imageName = `${Date.now()}-${email}.${ext}`;
    const imagePath = path.join(
      __dirname,
      "../uploads/profilePictures",
      imageName
    );
    const base64Data = photo.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(imagePath, base64Data, "base64");

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      github,
      photo: imageName,
    });

    //adding level
    const defaultLevel = await Level.findOne({
      where: { id: 1 },
    });
    if (!defaultLevel) {
      res.status(404).json({ error: "Cannot give level to user" });
      return;
    }
    await UserLevel.create({ UserId: user.id, LevelId: defaultLevel.id });

    res.status(200).json({ message: "Succes" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.createProfileAdmin = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create users from JSON file by admin'
  // #swagger.description = 'Endpoint to create users from JSON file by admin'
  const { users } = req.body;

  if (!users || !users.users) {
    return res.status(400).json({ error: "No user JSON data found" });
  }

  try {
    const userList = users.users;

    for (const user of userList) {
      const {
        id,
        firstName,
        lastName,
        email,
        password,
        github,
        photo,
        createdAt,
        updatedAt,
      } = user;

      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        console.log(
          `Skipping user creation for ${email}. Email already exists.`
        );
        continue;
      }

      await User.create({
        id,
        firstName,
        lastName,
        email,
        password,
        github,
        photo,
        createdAt,
        updatedAt,
      });
    }

    res.status(200).json({ message: "Users created successfully" });
  } catch (error) {
    console.error("Error creating users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.editProfile = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Edit user profile'
  // #swagger.description = 'Endpoint to edit user profile.'
  const userId = req.user.id;
  const { firstName, lastName, email, password, github, photo } = req.body;
  if (!firstName && !lastName && !email && !password && !github && !photo) {
    console.log("create profile data send:", req.body);
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const user = await User.findByPk(userId);
  try {
    const updateData = {};

    if (firstName) {
      updateData.firstName = firstName;
    }
    if (lastName) {
      updateData.lastName = lastName;
    }
    if (email) {
      updateData.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    if (github) {
      updateData.github = github;
    }
    if (photo) {
      const ext = photo.substring(photo.indexOf("/") + 1, photo.indexOf(";"));
      const imageName = `${Date.now()}-${email}.${ext}`;
      const imagePath = path.join(
        __dirname,
        "../uploads/profilePictures",
        imageName
      );
      const base64Data = photo.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(imagePath, base64Data, "base64");
      updateData.photo = imageName;
    }

    await user.update(updateData);
    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

exports.editProfileAdmin = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Edit user profile. Only for admin.'
  // #swagger.description = 'Endpoint to edit user profile as admin.'
  const userId = req.params.id;
  const { firstName, lastName, email, password, github, photo } = req.body;
  if (!firstName && !lastName && !email && !password && !github && !photo) {
    console.log("create profile data send:", req.body);
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const user = await User.findByPk(userId);
  try {
    const updateData = {};

    if (firstName) {
      updateData.firstName = firstName;
    }
    if (lastName) {
      updateData.lastName = lastName;
    }
    if (email) {
      updateData.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    if (github) {
      updateData.github = github;
    }
    if (photo) {
      const ext = photo.substring(photo.indexOf("/") + 1, photo.indexOf(";"));
      const imageName = `${Date.now()}-${email}.${ext}`;
      const imagePath = path.join(
        __dirname,
        "../uploads/profilePictures",
        imageName
      );
      const base64Data = photo.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(imagePath, base64Data, "base64");
      updateData.photo = imageName;
    }

    await user.update(updateData);
    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};

exports.deleteProfile = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Delete user profile'
  // #swagger.description = 'Endpoint to delete user profile.'
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    await user.destroy();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProfileAdmin = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Delete user profile as admin'
  // #swagger.description = 'Endpoint to delete user profile as admin.'
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    await user.destroy();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsers = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get users'
  // #swagger.description = 'Endpoint to get users.'
  const { query } = req.query;
  let users;

  try {
    if (!query) {
      users = await User.findAll({
        include: [
          {
            model: User,
            as: "followers",
          },
        ],
      });
      users.sort((a, b) => b.followers.length - a.followers.length);
      users = users.slice(0, 10);
    } else {
      users = await User.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.substring]: query } },
            { lastName: { [Op.substring]: query } },
          ],
          id: {
            [Op.not]: adminId,
          },
        },
      });
    }

    const response = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photo,
    }));

    /* #swagger.responses[200] = {
      description: 'Success',
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/User'
        }
      }
    } */
    res.status(200).json({ response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUsersAdmin = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Export users as admin'
  // #swagger.description = 'Endpoint to export users as admin.'
  try {
    const users = await User.findAll();

    const usersJson = JSON.stringify({ users }, null, 2);

    const tempFilePath = path.join(__dirname, "../temp/posts.json");
    fs.writeFileSync(tempFilePath, usersJson);

    res.setHeader("Content-Disposition", 'attachment; filename="users.json"');
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Access-Control-Expose-Headers", "Content-Type");
    res.status(200);

    fs.createReadStream(tempFilePath).pipe(res);

    res.on("finish", () => {
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserById = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get user by ID'
  // #swagger.description = 'Endpoint to get a specific user by ID.'
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: ["id", "firstName", "lastName", "email", "github", "photo"],
    });

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        $ref: '#/components/schemas/User'
      }
    } */
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createLikeNotification = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create like notification'
  // #swagger.description = 'Endpoint to create a notification for a like on a post.'
  const postId = req.params.postId;
  const notificatingId = req.user.id;

  try {
    const post = await Post.findOne({
      where: { id: postId },
      attributes: ["UserId"],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const notificatedId = post.UserId;

    const notificatingUser = await User.findOne({
      where: { id: notificatingId },
      attributes: ["id", "firstName", "lastName"],
    });

    const content = `${notificatingUser.firstName} ${notificatingUser.lastName} liked your post.`;

    const notification = await Notification.create({
      notificatedId,
      notificatingId,
      content,
      viewed: "no",
      postId,
    });

    res.status(201).json({ message: "Notification created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error. There was a problem when creating notification",
    });
  }
};

exports.createCommentNotification = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create comment notification'
  // #swagger.description = 'Endpoint to create a notification for a comment on a post.'
  const postId = req.params.postId;
  const notificatingId = req.user.id;
  try {
    const post = await Post.findOne({
      where: { id: postId },
      attributes: ["UserId"],
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const notificatedId = post.UserId;
    const notificatingUser = await User.findOne({
      where: { id: req.user.id },
      attributes: ["id", "firstName", "lastName"],
    });

    const content = `${notificatingUser.firstName} ${notificatingUser.lastName} added a comment to your post.`;
    const notification = await Notification.create({
      notificatedId,
      notificatingId,
      content,
      viewed: "no",
      postId,
    });
    res.status(201).json({ message: "Notification created successfully" });
  } catch {
    res.status(500).json({
      error: "Server error. There was a problem when creating notification",
    });
  }
};

exports.getNotifications = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get notifications'
  // #swagger.description = 'Endpoint to get notifications for a user.'

  const userId = req.user.id;
  const count = req.query.count;
  try {
    const notifications = await Notification.findAll({
      where: { notificatedId: userId },
      order: [["createdAt", "DESC"]],
      limit: count,
      include: [
        {
          model: Post,
          attributes: ["id"],
        },
        {
          model: User,
          as: "notificating",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "github",
            "photo",
          ],
        },
      ],
    });

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Notification'
        }
      }
    } */
    res.status(200).json({ notifications });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.followUser = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Follow user'
  // #swagger.description = 'Endpoint to follow a user.'
  const follow = {
    followerId: req.user.id,
    followingId: req.params.id,
  };
  try {
    const data = await Follow.create(follow);
    res.status(200).json({ message: "Follow created succesfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error. Could not create follow" });
  }
};

exports.getFollowings = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get followings'
  // #swagger.description = 'Endpoint to get the followings of a user.'
  const userId = req.params.id;
  try {
    const followings = await Follow.findAll({
      where: {
        followerId: userId,
        status: "accepted",
      },
      include: [
        {
          model: User,
          as: "followings",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "github",
            "photo",
          ],
        },
      ],
    });

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/User'
        }
      }
    } */
    res.status(200).json({ followings });
  } catch (err) {
    console.log(err);
    res.status(404).json({ Error: "Followings not found" });
  }
};

exports.getFollowers = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get followers'
  // #swagger.description = 'Endpoint to get the followers of a user.'
  const userId = req.params.id;
  try {
    const followers = await Follow.findAll({
      where: {
        followingId: userId,
        status: "accepted",
      },
      include: [
        {
          model: User,
          as: "followers",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "github",
            "photo",
          ],
        },
      ],
    });

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/User'
        }
      }
    } */
    res.status(200).json({ followers });
  } catch (err) {
    console.log(err);
    res.status(404).json({ Error: "Followers not found" });
  }
};

exports.getFollowRequests = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get follow requests'
  // #swagger.description = 'Endpoint to get the follow requests for the authenticated user.'
  try {
    const followers = await Follow.findAll({
      where: {
        followingId: req.user.id,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "followers",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "github",
            "photo",
          ],
        },
      ],
      raw: true,
    });

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Follow'
        }
      }
    } */
    res.status(200).json({ followers });
  } catch (err) {
    console.log(err);
    res.status(404).json({ Error: "Follow requests were not found" });
  }
};

exports.unfollowUser = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Unfollow user'
  // #swagger.description = 'Endpoint to unfollow a user.'
  console.log("id:", req.params.id);
  console.log("followingId: ", req.user.id);
  const follow = {
    followerId: req.user.id,
    followingId: req.params.id,
  };
  try {
    await Follow.destroy({ where: follow });
    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ Error: "Server error. Could not unfollow." });
  }
};

exports.acceptFollowRequest = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Accept follow request'
  // #swagger.description = 'Endpoint to accept a follow request.'
  try {
    const follow = await Follow.findOne({
      where: {
        id: req.params.id,
        followingId: req.user.id,
        status: "pending",
      },
    });

    if (!follow) {
      return res.status(404).send({
        message: "Follow request not found.",
      });
    }

    follow.status = "accepted";
    await follow.save();

    res.status(200).json({
      message: "Follow request accepted.",
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Server error. Could not accept follow request." });
  }
};

exports.rejectFollowRequest = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Reject follow request'
  // #swagger.description = 'Endpoint to reject a follow request.'
  try {
    const follow = await Follow.findOne({
      where: {
        id: req.params.id,
        followingId: req.user.id,
        status: "pending",
      },
    });

    if (!follow) {
      return res.status(404).json({
        message: "Follow request not found.",
      });
    }

    follow.status = "rejected";
    await follow.save();

    res.status(200).json({
      message: "Follow request rejected.",
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Server error. Could not reject follow request." });
  }
};

exports.bulkCreate = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create users in bulk'
  // #swagger.description = 'Endpoint to create multiple users in bulk.'
  const userData = [];
  const password = "123";
  const hashedPassword = await bcrypt.hash(password, 10);
  for (let i = 0; i < 5; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email();
    const github = faker.internet.url();
    const photoUrl = faker.image.avatar();

    const imageName = `${Date.now()}-${email}.png`;
    const imagePath = path.join(
      __dirname,
      "../uploads/profilePictures",
      imageName
    );

    const response = await axios.get(photoUrl, {
      responseType: "arraybuffer",
    });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

    userData.push({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      github,
      photo: imageName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  try {
    const createdUsers = await User.bulkCreate(userData);

    const defaultLevel = await Level.findOne({
      where: { id: 1 },
    });

    if (!defaultLevel) {
      res.status(404).json({ error: "Cannot give level to user" });
      return;
    }

    const userLevelData = [];
    for (const user of createdUsers) {
      const userLevel = await UserLevel.findOne({
        where: { UserId: user.id },
      });

      if (!userLevel) {
        userLevelData.push({
          UserId: user.id,
          LevelId: defaultLevel.id,
        });
      }
    }

    await UserLevel.bulkCreate(userLevelData);

    res.status(201).json({ message: "Users created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error creating users" });
  }
};

exports.bulkCreateFollows = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create follow relationships in bulk'
  // #swagger.description = 'Endpoint to create multiple follow relationships in bulk.'
  try {
    const users = await User.findAll({ order: sequelize.random(), limit: 5 });
    const followData = [];
    for (let i = 0; i < users.length; i++) {
      const followerId = users[i].id;
      if (followerId != "45463347") {
        const followingId = users[(i + 1) % users.length].id;
        const existingFollow = await Follow.findOne({
          where: { followerId, followingId },
        });
        if (existingFollow === null) {
          followData.push({
            followerId,
            followingId,
            status: "accepted",
            requestedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }
    await Follow.bulkCreate(followData);
    res
      .status(201)
      .json({ message: "Follow relationships created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error creating follow relationships" });
  }
};

exports.getCurrentUser = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get current user'
  // #swagger.description = 'Endpoint to get the details of the authenticated user.'
  try {
    // console.log(req.session);
    // console.log(req.user);

    const { fields } = req.query;
    const attributes = fields
      ? fields.split(",")
      : ["id", "firstName", "lastName", "email", "github", "photo"];

    const user = await User.findByPk(req.user.id, {
      attributes,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/User'
        }
      }
    } */
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getFollowStatus = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get follow status'
  // #swagger.description = 'Endpoint to get the follow status between the authenticated user and another user.'
  try {
    const currentUserId = req.user.id;
    const userId = req.params.id;

    const follow = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    let status = "not following";
    if (follow) {
      status = follow.status;
    }

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        $ref: '#/components/schemas/FollowStatus'
      }
    } */
    res.status(200).json({ response: status });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Follow status not found" });
  }
};

exports.getRepos = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get Github repos of an user'
  // #swagger.description = 'Endpoint to get the Github repos of an user'
  const accessToken = getAccessTokenByUserId(req.user.id);

  const octokit = new Octokit({
    auth: accessToken,
  });

  try {
    const response = await octokit.request("GET /user/repos", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
      visibility: "public",
    });
    const repositories = response.data;

    const summarizedData = [];
    for (const repo of repositories) {
      try {
        const title = repo.name;
        const link = repo.html_url;
        const description = repo.description;

        summarizedData.push({
          title,
          link,
          description,
        });
      } catch (err) {
        console.log(err);
      }
    }

    res.status(200).json({ summarizedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve user repositories" });
  }
};

exports.createActionDefinition = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create an action definition'
  // #swagger.description = 'Endpoint to create an action definition.'

  const { name, points, description } = req.body;

  try {
    if (!name || !points || !description) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const action = await Action.create({
      name,
      points,
      description,
    });

    res.status(200).json({ message: "Action created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getActionDefinitions = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get Action Definitions'
  // #swagger.description = 'Endpoint to get all action definitions.'

  try {
    const actions = await Action.findAll();

    res.status(200).json({ actions });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.editActionDefinitions = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Edit an action definition'
  // #swagger.description = 'Endpoint to edit an existing action definition.'

  const actionId = req.params.id;
  const { name, points, description } = req.body;

  try {
    const action = await Action.findByPk(actionId);

    if (!action) {
      res.status(404).json({ error: "Action not found" });
      return;
    }

    action.name = name;
    action.points = points;
    action.description = description;

    await action.save();

    res.status(200).json({ message: "Action updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.deleteActionDefinition = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Delete an action definition by ID'
  // #swagger.description = 'Endpoint to delete an action definition by its ID.'

  const actionId = req.params.id;

  try {
    const action = await Action.findByPk(actionId);

    if (!action) {
      res.status(404).json({ error: "Action not found" });
      return;
    }

    await action.destroy();

    res.status(200).json({ message: "Action deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.createUserAction = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create a user action'
  // #swagger.description = 'Endpoint to create a user action.'

  const { UserId, ActionId, createdAt } = req.body;
  console.log("userid:", UserId);
  console.log("actionId:", ActionId);
  console.log("createdAt:", createdAt);
  try {
    if (!UserId || !ActionId || !createdAt) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const userAction = await UserAction.create({
      UserId,
      ActionId,
      createdAt,
    });

    res.status(200).json({ message: "User action created successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "There was a problem with the creating of action" });
    console.log(err);
  }
};

exports.getUserActions = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get User Actions '
  // #swagger.description = 'Endpoint to get actions performed by a user.'

  const userId = req.params.id;

  try {
    const userActions = await UserAction.findAll({ where: { UserId: userId } });

    let actionCounts = {
      like: 0,
      comment: 0,
      createPost: 0,
    };

    for (const action of userActions) {
      const actionDetails = await Action.findByPk(action.ActionId);

      if (actionDetails.name === "like") {
        actionCounts.like++;
      } else if (actionDetails.name === "comment") {
        actionCounts.comment++;
      } else if (actionDetails.name === "createPost") {
        actionCounts.createPost++;
      }
    }

    res.status(200).json({ actionCounts });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.updateUserAction = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Update a user action'
  // #swagger.description = 'Endpoint to update an existing user action.'

  const userActionId = req.params.id;
  const { userId, actionId } = req.body;

  try {
    const userAction = await UserAction.findByPk(userActionId);

    if (!userAction) {
      res.status(404).json({ error: "User action not found" });
      return;
    }

    userAction.userId = userId;
    userAction.actionId = actionId;

    await userAction.save();

    res.status(200).json({ message: "User action updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.deleteUserAction = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Delete a user action by ID'
  // #swagger.description = 'Endpoint to delete a user action by its ID.'

  const userActionId = req.params.id;

  try {
    const userAction = await UserAction.findByPk(userActionId);

    if (!userAction) {
      res.status(404).json({ error: "User action not found" });
      return;
    }

    await userAction.destroy();

    res.status(200).json({ message: "User action deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.createLevelDefinition = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create a level definition'
  // #swagger.description = 'Endpoint to create a level definition.'

  const { name, minPoints, maxPoints, description } = req.body;

  try {
    if (!name || !minPoints || !maxPoints || !description) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const levelDefinition = await Level.create({
      name,
      minPoints,
      maxPoints,
      description,
    });

    res.status(200).json({
      message: "Level definition created successfully",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getLevelDefinitions = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get all level definitions'
  // #swagger.description = 'Endpoint to get all level definitions.'

  try {
    const levelDefinitions = await Level.findAll();

    res.status(200).json({ levelDefinitions });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateLevelDefinition = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Update a level definition'
  // #swagger.description = 'Endpoint to update a level definition.'

  const levelDefinitionId = req.params.id;
  const { name, minPoints, maxPoints, description } = req.body;

  try {
    const levelDefinition = await Level.findByPk(levelDefinitionId);

    if (!levelDefinition) {
      res.status(404).json({ error: "Level definition not found" });
      return;
    }

    levelDefinition.name = name;
    levelDefinition.minPoints = minPoints;
    levelDefinition.maxPoints = maxPoints;
    levelDefinition.description = description;

    await levelDefinition.save();

    res.status(200).json({
      message: "Level definition updated successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.deleteLevelDefinition = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Delete a level definition by ID'
  // #swagger.description = 'Endpoint to delete a level definition by its ID.'

  const levelDefinitionId = req.params.id;

  try {
    const levelDefinition = await Level.findByPk(levelDefinitionId);

    if (!levelDefinition) {
      res.status(404).json({ error: "Level definition not found" });
      return;
    }

    await levelDefinition.destroy();

    res.status(200).json({ message: "Level definition deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.createUserLevel = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create a user level'
  // #swagger.description = 'Endpoint to create a user level.'

  const { userId, levelId, points } = req.body;

  try {
    if (!userId || !levelId || !points) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const userLevel = await UserLevel.create({
      userId,
      levelId,
      points,
    });

    res.status(200).json({ message: "User level created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserLevels = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get all user levels'
  // #swagger.description = 'Endpoint to get all user levels.'

  try {
    const userLevels = await UserLevel.findAll();

    res.status(200).json({ userLevels });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserLevelsById = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get user levels by user ID'
  // #swagger.description = 'Endpoint to get user levels based on the user ID.'

  const userId = req.params.id;

  try {
    const userLevels = await UserLevel.findAll({ where: { UserId: userId } });

    if (userLevels.length === 0) {
      res.status(404).json({ error: "User levels not found" });
      return;
    }

    res.status(200).json({ userLevels });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.updateUserLevel = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Update a user level'
  // #swagger.description = 'Endpoint to update an existing user level.'

  const currentUserId = req.params.id;

  try {
    const userLevel = await UserLevel.findOne({
      where: { UserId: currentUserId },
    });

    if (!userLevel) {
      res.status(404).json({ error: "User level not found" });
      return;
    }

    // calculate points
    const userActions = await UserAction.findAll({
      where: { UserId: currentUserId },
    });
    let totalPoints = 0;

    for (const action of userActions) {
      const actionData = await Action.findByPk(action.ActionId);
      if (actionData) {
        totalPoints += actionData.points;
      }
    }

    userLevel.points = totalPoints;

    // update level if necessary
    const nextLevelId = userLevel.LevelId + 1;
    const nextLevel = await Level.findByPk(nextLevelId);

    if (nextLevel && userLevel.points >= nextLevel.minPoints) {
      userLevel.LevelId = nextLevel.id;
    }
    await userLevel.save();

    res.status(200).json({ message: "User level updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};

exports.deleteUserLevel = async function (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Delete a user level by ID'
  // #swagger.description = 'Endpoint to delete a user level by its ID.'

  const userLevelId = req.params.id;

  try {
    const userLevel = await UserLevel.findByPk(userLevelId);

    if (!userLevel) {
      res.status(404).json({ error: "User level not found" });
      return;
    }

    await userLevel.destroy();

    res.status(200).json({ message: "User level deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "There was a problem with the server" });
    console.log(err);
  }
};
