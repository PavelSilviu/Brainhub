const { Post, User, Like, Comment, Follow, UserAction } = require("../models");
const moment = require("../node_modules/moment");
const fs = require("fs");
const path = require("path");
const { faker } = require("@faker-js/faker");
const axios = require("axios");
const { updateLocale } = require("moment/moment");
const postsData = require("../postsData.json");

exports.bulkCreateByUserId = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Bulk create posts by user ID'
  // #swagger.description = 'Endpoint to bulk create posts for a specific user.'
  const postData = [];
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing parameter" });
  }

  for (let i = 0; i < 10; i++) {
    const description = faker.lorem.sentences();
    const photoUrl = faker.image.image();
    const link = faker.internet.url();

    const imageName = `${Date.now()}-${userId}-${i}.png`;
    const imagePath = path.join(__dirname, "../uploads/postsImages", imageName);

    const response = await axios.get(photoUrl, {
      responseType: "arraybuffer",
    });
    fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

    postData.push({
      description,
      photo: imageName,
      link,
      createdAt: new Date(),
      updatedAt: new Date(),
      UserId: userId,
    });
  }

  try {
    await Post.bulkCreate(postData);
    res.status(201).json({ message: "Posts created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error creating posts" });
  }
};

exports.bulkCreate = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Bulk create posts'
  // #swagger.description = 'Endpoint to bulk create posts for multiple users.'
  const postData = [];
  const users = await User.findAll();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.id !== "45463347") {
      for (let j = 0; j < 10; j++) {
        const description = faker.lorem.sentences();
        const photoUrl = faker.image.image();
        const link = faker.internet.url();

        const imageName = `${Date.now()}-${user.id}-${j}.png`;
        const imagePath = path.join(
          __dirname,
          "../uploads/postsImages",
          imageName
        );

        const response = await axios.get(photoUrl, {
          responseType: "arraybuffer",
        });
        fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

        postData.push({
          description,
          photo: imageName,
          link,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserId: user.id,
        });
      }
    }
  }

  try {
    await Post.bulkCreate(postData);
    res.status(201).json({ message: "Posts created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error seeding posts" });
  }
};

exports.bulkCreateV2 = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Bulk create posts'
  // #swagger.description = 'Endpoint to bulk create posts for multiple users.'
  const postData = [];
  const users = await User.findAll();

  const photoFilesPath = path.join(__dirname, "../postsPhotosForBulkCreate");
  const photoFiles = fs.readdirSync(photoFilesPath);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user.id !== "45463347") {
      for (let j = 0; j < 4; j++) {
        const { description, link } = getRandomPostData();

        const randomIndex = Math.floor(Math.random() * photoFiles.length);
        const photoName = `${Date.now()}-${user.id}-${j}.png`;
        const sourcePath = path.join(
          __dirname,
          "../postsPhotosForBulkCreate",
          photoFiles[randomIndex]
        );
        const destinationPath = path.join(
          __dirname,
          "../uploads/postsImages",
          photoName
        );

        // Read the photo file from sourcePath
        const photoData = fs.readFileSync(sourcePath);

        // Write the photo file to destinationPath
        fs.writeFileSync(destinationPath, photoData);

        postData.push({
          description,
          photo: photoName,
          link,
          createdAt: new Date(),
          updatedAt: new Date(),
          UserId: user.id,
        });

        const userAction = await UserAction.create({
          UserId: user.id,
          ActionId: 3,
        });
      }
    }
  }

  try {
    await Post.bulkCreate(postData);
    res.status(201).json({ message: "Posts created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error seeding posts" });
  }
};

function getRandomPostData() {
  const randomIndex = Math.floor(Math.random() * postsData.length);
  return postsData[randomIndex];
}

exports.createPost = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Create a new post'
  // #swagger.description = 'Endpoint to create a new post.'
  const { description, link, photo } = req.body;
  const userId = req.user.id;
  if (!userId || !description || !photo) {
    res.status(400).json({ error: "postController: Missing required fields" });
    return;
  }
  try {
    const postsImageDir = path.join(__dirname, "../uploads/postsImages");
    const imageName = `${Date.now()}-${req.user.email}.png`;
    const imagePath = path.join(postsImageDir, imageName);

    const base64Data = photo.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(imagePath, base64Data, "base64");

    const post = await Post.create({
      description: description,
      photo: imageName,
      link: link,
      UserId: userId,
    });
    res.setHeader("Location", `/posts/${post.id}`);
    res.setHeader("Access-Control-Expose-Headers", "Location");
    res.status(201).json({ message: "Post created succesfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Bad Request. Failed to create post" });
  }
};

exports.createPostsAdmin = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Create post profiles from JSON file by admin'
  // #swagger.description = 'Endpoint to create post profiles from JSON file by admin'
  const { posts } = req.body;

  if (!posts || !posts.posts) {
    return res.status(400).json({ error: "No post JSON data found" });
  }

  try {
    const postList = posts.posts;

    for (const post of postList) {
      const { id, description, photo, link, createdAt, updatedAt, UserId } =
        post;

      const postExists = await Post.findOne({ where: { id } });

      if (postExists) {
        console.log(
          `Skipping post creation for ID ${id}. Post already exists.`
        );
        continue;
      }

      await Post.create({
        id,
        description,
        photo,
        link,
        createdAt,
        updatedAt,
        UserId,
      });
    }

    res.status(200).json({ message: "Post profiles created successfully" });
  } catch (error) {
    console.error("Error creating post profiles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.editPost = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Edit a post'
  // #swagger.description = 'Endpoint to edit a post.'

  try {
    const postId = req.params.id;
    const { photo, link, description } = req.body;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.UserId !== req.user.id) {
      return res
        .status(401)
        .json({ error: "You are not authorized to edit this post" });
    }

    const updatedPost = {};
    if (photo) {
      const postsImageDir = path.join(__dirname, "../uploads/postsImages");
      const imageName = `${Date.now()}-${req.user.email}.png`;
      const imagePath = path.join(postsImageDir, imageName);

      const base64Data = req.body.photo.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(imagePath, base64Data, "base64");

      updatedPost.photo = imageName;
    }
    if (link) {
      updatedPost.link = link;
    }
    if (description) {
      updatedPost.description = description;
    }

    await post.update(updatedPost);
    return res.status(200).json({ message: "Post edited successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to edit post" });
  }
};

exports.editPostAdmin = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Edit a post'
  // #swagger.description = 'Endpoint to edit a post.'
  try {
    const postId = req.params.id;
    const { photo, link, description } = req.body;
    updatedPost = {};
    if (!photo && !link && !description) {
      res.status(400).json({ error: "Missing required fields" });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (photo) {
      const postsImageDir = path.join(__dirname, "../uploads/postsImages");
      const imageName = `${Date.now()}-${req.user.email}.png`;
      const imagePath = path.join(postsImageDir, imageName);

      const base64Data = req.body.photo.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(imagePath, base64Data, "base64");

      updatedPost.photo = imageName;
    }
    if (link) {
      updatedPost.link = link;
    }
    if (description) {
      updatedPost.description = description;
    }

    await post.update(updatedPost);
    return res.status(200).json({ message: "Post edited successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to edit post" });
  }
};

exports.deletePost = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Delete a post'
  // #swagger.description = 'Endpoint to delete a post.'
  try {
    const postId = req.params.id;
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.UserId != req.user.id) {
      console.log("user id: ", req.user.id);
      console.log("userid id from post: ", post.UserId);
      return res.status(401).json({ message: "Unauthorized" });
    }
    await post.destroy();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deletePostAdmin = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Delete a post'
  // #swagger.description = 'Endpoint to delete a post.'
  try {
    const postId = req.params.id;
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await post.destroy();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createLike = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Create a like'
  // #swagger.description = 'Endpoint to create a like for a post.'

  try {
    const postId = req.params.id;
    const like = await Like.create({
      userId: req.user.id,
      PostId: postId,
    });
    res.status(200).json({ message: "Like created succesfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteLike = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Delete a like'
  // #swagger.description = 'Endpoint to delete a like.'
  const likeId = req.user.likeId;
  var like = null;
  try {
    like = await Like.findOne({
      where: { id: likeId },
    });
  } catch (err) {
    res.status(404).json({ message: "Like not found" });
    return;
  }
  try {
    await like.destroy();
    res.status(200).json({ message: "Like deleted succesfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "There was a problem when deleting your like" });
  }
};

exports.createComment = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Create a comment'
  // #swagger.description = 'Endpoint to create a comment.'
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const comment = await Comment.create({
      text: content,
      userId: req.user.id,
      PostId: postId,
    });
    res.status(200).json({ message: "Comment created succesfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.editComment = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Edit a comment'
  // #swagger.description = 'Endpoint to edit a comment.'
  const commentId = req.params.commentId;
  var comment = null;
  const updatedComment = req.body;
  try {
    comment = await Comment.findOne({
      where: { id: commentId },
    });
  } catch (err) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }
  if (!updatedComment) {
    res.status(400).json({ message: "Bad request. Missing comment text" });
    return;
  }
  try {
    await comment.update(updatedComment);
    res.status(200).json({ message: "Comment edited succesfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "There was a problem when editing your comment" });
  }
};

exports.deleteComment = async function (req, res) {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Delete a comment'
  // #swagger.description = 'Endpoint to delete a comment.'
  const commentId = req.params.commentId;
  var comment = null;
  try {
    comment = await Comment.findOne({
      where: { id: commentId },
    });
  } catch (err) {
    res.status(404).json({ message: "Comment not found" });
    return;
  }
  try {
    await comment.destroy();
    res.status(200).json({ message: "Comment deleted succesfully" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "There was a problem when deleting your comment" });
  }
};

exports.getPost = async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Get a post'
  // #swagger.description = 'Endpoint to get a specific post by ID.'
  const postId = req.params.id;

  try {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: Comment,
          include: [
            {
              model: User,
              as: "commenter",
            },
          ],
        },
        {
          model: Like,
          include: [
            {
              model: User,
              as: "liker",
            },
          ],
        },
        {
          model: User,
        },
      ],
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        $ref: '#/components/schemas/Post'
      }
    } */
    res.status(200).json({ post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPostsAdmin = async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Export posts as admin'
  // #swagger.description = 'Endpoint to export posts as admin'
  try {
    const posts = await Post.findAll();

    const postsJson = JSON.stringify({ posts }, null, 2);

    const tempFilePath = path.join(__dirname, "../temp/posts.json");
    fs.writeFileSync(tempFilePath, postsJson);

    res.setHeader("Content-Disposition", 'attachment; filename="posts.json"');
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Access-Control-Expose-Headers", "Content-Type");
    res.status(200);
    fs.createReadStream(tempFilePath).pipe(res);
    res.on("finish", () => {
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPostsByUserId = async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Get posts by user ID'
  // #swagger.description = 'Endpoint to get posts by user ID.'
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    // console.log("userCONTROLLER:", req.query);
    // console.log("userCONTROLLER:", userId);
    const filter = req.query.filter;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    let followingIds;

    if (filter === "following") {
      const following = await Follow.findAll({
        where: { followerId: userId, status: "accepted" },
      });
      followingIds = following.map((follow) => follow.followingId);
    } else {
      followingIds = userId;
    }

    const posts = await Post.findAll({
      where: { userId: followingIds },
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
      include: [
        {
          model: Comment,
          include: [
            {
              model: User,
              as: "commenter",
            },
          ],
        },
        {
          model: Like,
        },
        {
          model: User,
        },
      ],
    });

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Post'
        }
      }
    } */
    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPostLikesCount = async (req, res) => {
  // #swagger.tags = ['Posts']
  // #swagger.summary = 'Get likes count for a post'
  // #swagger.description = 'Endpoint to get the number of likes for a specific post.'

  const postId = req.params.id;

  try {
    const likesCount = await Like.count({
      where: { PostId: postId },
    });

    /*     #swagger.responses[200] = {
      description: 'Success',
      schema: {
        $ref: '#/components/schemas/LikeCount'
      }
    } */
    res.status(200).json({ count: likesCount });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error. Unable to get post likes count" });
  }
};
