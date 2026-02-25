const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require("../middleware/rbac");

router.post('/', requireAuth, orderController.createOrder);

router.get('/creator-earnings', requireAuth, orderController.getCreatorSales);

module.exports = router;