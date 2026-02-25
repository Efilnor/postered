const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { requireAuth, hasPermission } = require('../middleware/rbac');

router.get('/dashboard', requireAuth, hasPermission('*:*'), adminCtrl.getAdminStats);
router.put('/users/:userId/role', requireAuth, hasPermission('*:*'), adminCtrl.updateUserRole);module.exports = router;