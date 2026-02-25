const db = require("../models");
const Order = db.Orders;
const OrderItem = db.OrderItems;
const Design = db.Designs;

exports.createOrder = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.id || req.user.userId || req.user.sub;
    const newOrder = await Order.create(
      {
        buyerId: userId,
        totalPrice: totalAmount,
        status: "PAID",
      },
      { transaction: t },
    );

    for (const item of items) {
      await OrderItem.create(
        {
          orderId: newOrder.id,
          designId: item.designId || item.id,
          sizeId: item.sizeId || 1,
          quantity: item.quantity || 1,
          unitPrice: parseFloat(Number(item.unitPrice || item.price).toFixed(2)), // Accepte les deux formats
        },
        { transaction: t },
      );

      await Design.increment("salesCount", {
        by: item.quantity || 1,
        where: { id: item.designId || item.id },
        transaction: t,
        silent: true,
      });
    }
    await t.commit();

    res.status(201).json({
      message: "Commande validée avec succès",
      orderId: newOrder.id,
    });
  } catch (error) {
    await t.rollback();
    console.error("ERREUR COMMANDE :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la commande" });
  }
};

exports.getCreatorSales = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });

    let mySales = [];

    for (const order of orders) {
      const creatorItems = order.items.filter(
        (item) => item.creatorId === creatorId,
      );

      if (creatorItems.length > 0) {
        creatorItems.forEach((item) => {
          mySales.push({
            orderId: order.id,
            date: order.createdAt,
            designId: item.designId,
            title: item.title,
            price: item.price,
            size: item.size,
          });
        });
      }
    }

    

    res.status(200).json(mySales);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des ventes" });
  }
};
