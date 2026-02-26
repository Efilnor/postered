const db = require("../models");

// Récupérer les statistique du site
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await db.Users.count();
    const totalOrders = await db.Orders.count();
    const totalRevenue = await db.Orders.sum('totalPrice') || 0;
    
    const users = await db.Users.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      include: [{ model: db.Groups, as: 'group', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      stats: { totalUsers, totalOrders, totalRevenue: parseFloat(totalRevenue).toFixed(2) },
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Changer le rôle de l'utilisateur
exports.updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    const group = await db.Groups.findOne({ where: { name: role } });
    if (!group) return res.status(404).json({ error: "Groupe non trouvé" });

    await db.Users.update({ groupId: group.id }, { where: { id: userId } });
    res.json({ message: "Rôle mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};