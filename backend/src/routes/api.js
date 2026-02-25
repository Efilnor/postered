const express = require('express');
const { requireAuth, hasPermission } = require('../middleware/rbac');

const router = express.Router();

router.get('/public', (req, res) => res.json({ msg: 'Public endpoint' }));
router.get('/protected', requireAuth, (req, res) => res.json({ msg: 'Protected content', user: req.user }));
router.get('/admin', requireAuth, hasPermission('*:*'), (req, res) => res.json({ msg: 'Admin only' }));

module.exports = router;
