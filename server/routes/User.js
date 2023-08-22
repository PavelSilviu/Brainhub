const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const adminAuthMiddleware = require("../middleware/adminAuth");

router.post("/bulk-create", userController.bulkCreate);
router.post("/action-definitions", userController.createActionDefinition);
router.post("/level-definitions", userController.createLevelDefinition);
router.post("/actions", userController.createUserAction);
router.post("/levels", authMiddleware, userController.createUserLevel);
router.post("/follows/bulk-create", userController.bulkCreateFollows);
router.post("/", userController.createProfile);
router.post("/admin",adminAuthMiddleware, userController.createProfileAdmin);
router.post("/follows/:id", authMiddleware, userController.followUser);
router.post(
  "/notifications/like/:postId",
  authMiddleware,
  userController.createLikeNotification
);
router.post(
  "/notifications/comment/:postId",
  authMiddleware,
  userController.createCommentNotification
);

router.get("/current", authMiddleware, userController.getCurrentUser);
router.get("/action-definitions", userController.getActionDefinitions);
router.get("/level-definitions", userController.getLevelDefinitions);
router.get("/levels", authMiddleware, userController.getUserLevels);
router.get("/", authMiddleware, userController.getUsers);
router.get(
  "/:id/actions/count/",
  authMiddleware,
  userController.getUserActions
);
router.get("/:id/levels/", authMiddleware, userController.getUserLevelsById);
router.get("/:id/followings", authMiddleware, userController.getFollowings);
router.get("/:id/followers", authMiddleware, userController.getFollowers);
router.get(
  "/follow-requests",
  authMiddleware,
  userController.getFollowRequests
);
router.get("/notifications", authMiddleware, userController.getNotifications);
router.get(
  "/follow-status/:id",
  authMiddleware,
  userController.getFollowStatus
);
router.get("/repos", authMiddleware, userController.getRepos);
router.get("/admin", adminAuthMiddleware, userController.getUsersAdmin);
router.get("/:id", authMiddleware, userController.getUserById);

router.put("/", authMiddleware, userController.editProfile);
router.put("/admin/:id", adminAuthMiddleware, userController.editProfileAdmin);
router.put("/action-definitions", userController.editActionDefinitions);
router.put("/level-definitions/:id", userController.updateLevelDefinition);
router.put("/actions/:id", authMiddleware, userController.updateUserAction);
router.put(
  "/follow-requests/accept/:id",
  authMiddleware,
  userController.acceptFollowRequest
);
router.put(
  "/follow-requests/reject/:id",
  authMiddleware,
  userController.rejectFollowRequest
);
router.put("/:id/levels/", authMiddleware, userController.updateUserLevel);

router.delete("/", authMiddleware, userController.deleteProfile);
router.delete(
  "/admin/:id",
  adminAuthMiddleware,
  userController.deleteProfileAdmin
);
router.delete("/unfollow/:id", authMiddleware, userController.unfollowUser);
router.delete("/action-definitions/:id", userController.deleteActionDefinition);
router.delete("/level-definitions/:id", userController.deleteLevelDefinition);
router.delete("/actions/:id", authMiddleware, userController.deleteUserAction);
router.delete("/levels/:id", authMiddleware, userController.deleteUserLevel);

module.exports = router;
