const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/rbac");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/profile", requireAuth, authController.getProfile);
router.put("/profile/update", requireAuth, authController.updateProfile);

module.exports = router;