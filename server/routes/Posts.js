const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/auth");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/bulk-create/:userId", postController.bulkCreateByUserId);
router.post("/bulk-create", postController.bulkCreate);
router.post("/bulk-create-v2", postController.bulkCreateV2);
router.post("/", authMiddleware, postController.createPost);
router.post("/admin", adminAuthMiddleware, postController.createPostsAdmin);
router.post("/:id/likes", authMiddleware, postController.createLike);
router.post("/:id/comments", authMiddleware, postController.createComment);

router.get("/users/:userId", authMiddleware, postController.getPostsByUserId);
router.get("/admin", adminAuthMiddleware, postController.getPostsAdmin);
router.get("/:id", authMiddleware, postController.getPost);
router.get(
  "/:id/likes/count",
  authMiddleware,
  postController.getPostLikesCount
);

router.put("/:id", authMiddleware, postController.editPost);
router.put("/admin/:id", adminAuthMiddleware, postController.editPostAdmin);
router.put("/comments/:id", authMiddleware, postController.editComment);

router.delete("/:id", authMiddleware, postController.deletePost);
router.delete(
  "/admin/:id",
  adminAuthMiddleware,
  postController.deletePostAdmin
);
router.delete("/likes/:id", authMiddleware, postController.deleteLike);
router.delete("/comments/:id", authMiddleware, postController.deleteComment);

module.exports = router;
