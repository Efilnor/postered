const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const designCtrl = require("../controllers/designController");
const { requireAuth } = require("../middleware/rbac");

// --- Configuration Multer ---
const storage = multer.diskStorage({
  destination: "uploads/designs/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/my-designs", requireAuth, designCtrl.getMyDesigns);
router.get("/pending", requireAuth, designCtrl.getPendingDesigns);

router.post("/", requireAuth, upload.single("image"), designCtrl.createDesign);
router.get("/", designCtrl.getAllApproved);

router.patch("/:id(\\d+)/verify", requireAuth, designCtrl.verifyDesign);
router.get("/:id(\\d+)", designCtrl.getDesignById);

module.exports = router;