const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");

exports.register = async (req, res) => {
  const { email, password, firstName, lastName, group } = req.body;

  try {
    const existingUser = await db.Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Cet email est déjà utilisé" });

    const hash = await bcrypt.hash(password, 10);
    const groupName = group || "UserBuyer";
    
    let [targetGroup] = await db.Groups.findOrCreate({ where: { name: groupName } });

    const user = await db.Users.create({
      email,
      password: hash,
      firstName: firstName || "",
      lastName: lastName || "",
      groupId: targetGroup.id,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, group: groupName },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, group: groupName }
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création du compte" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.Users.findOne({
      where: { email },
      include: [{ 
        model: db.Groups, 
        as: "group",
        include: [{ model: db.Permissions }] 
      }],
    });

    if (!user) return res.status(401).json({ error: "Identifiants invalides" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });

   
    const permissions = user.group?.Permissions?.map(p => p.name) || [];

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        permissions: permissions 
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        permissions: permissions
      },
    });
  } catch (err) {
    console.error("🔥 ERREUR CRITIQUE LOGIN :", err); // Regarde tes logs serveurs !
    res.status(500).json({ error: "Erreur interne lors de la connexion" });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { pseudo, password } = req.body;
    const user = await db.Users.findByPk(req.user.userId, {
      include: [{ model: db.Groups, as: "group" }]
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (pseudo) user.pseudo = pseudo;
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({
      message: "Profil mis à jour",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        pseudo: user.pseudo,
        group: user.group?.name || "Guest"
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Impossible de mettre à jour le profil" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await db.Users.findByPk(userId, {
      attributes: ["firstName", "lastName", "email", "createdAt"],
      include: [
        {
          model: db.Groups,
          as: "group",
          attributes: ["name"],
        },
        {
          model: db.Orders,
          as: "orders",
          include: [
            {
              model: db.OrderItems,
              as: "items",
            },
          ],
        },
      ],
    });

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const plainUser = user.get({ plain: true });
    console.log(
      "STRUCTURE DES COMMANDES :",
      JSON.stringify(user.orders, null, 2),
    );
    res.json({
      user: {
        firstName: plainUser.firstName,
        lastName: plainUser.lastName,
        email: plainUser.email,
        createdAt: plainUser.createdAt,
        group: plainUser.group?.name || "Guest",
      },
      orders: plainUser.orders || [],
    });

    // TEST DE DEBUG DANS authController.js
    const totalItemsInDb = await db.OrderItems.count();
    const itemsForThisOrder = await db.OrderItems.findAll({
      where: { orderId: 1 },
    }); // Remplace 1 par l'ID de ta commande

  } catch (err) {
    console.error("DEBUG PROFILE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
