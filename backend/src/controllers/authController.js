const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");

// Enregistre un nouvel utilisateur
// Enregistre un nouvel utilisateur
exports.register = async (req, res) => {
  console.log("Données reçues du front :", req.body);
  const { email, password, firstName, lastName, group } = req.body;

  try {
    // 1. Vérification si l'utilisateur existe déjà
    const existingUser = await db.Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // 2. Sécurisation du mot de passe
    const hash = await bcrypt.hash(password, 10);

    // 3. Protection "Mass Assignment" : on valide le groupe
    // Seuls ces deux rôles sont autorisés via l'inscription publique
    const allowedGroups = ["UserBuyer", "UserCreator"];
    const groupName = allowedGroups.includes(group) ? group : "UserBuyer";

    // 4. Récupération ou création du groupe cible
    const [targetGroup] = await db.Groups.findOrCreate({
      where: { name: groupName },
    });

    // 5. Création de l'utilisateur en base
    const user = await db.Users.create({
      email,
      password: hash,
      firstName: firstName || "",
      lastName: lastName || "",
      groupId: targetGroup.id,
    });

    // 6. Récupération des permissions du groupe pour le token
    // On utilise findByPk pour récupérer les permissions liées au groupe tout juste créé/trouvé
    const groupWithPerms = await db.Groups.findByPk(targetGroup.id, {
      include: [{ model: db.Permissions }]
    });

    const permissions = groupWithPerms?.Permissions?.map(p => p.name) || [];

    // 7. Génération du JWT (On inclut userId et permissions pour le middleware)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        permissions: permissions 
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "8h" },
    );

    // 8. Enregistrement de la session dans le schéma 'security'
    // C'est ce qui permet au middleware requireAuth de valider l'accès
    await db.Sessions.create({
      token: token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // Expire dans 8h comme le JWT
      scopes: ["access"],
    });

    // 9. Réponse au Frontend
    // On renvoie un objet utilisateur complet pour éviter les bugs d'affichage
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        group: groupName,
        permissions: permissions, // Crucial pour que le front affiche les accès Créateur
      },
    });

  } catch (err) {
    console.error("ERREUR LORS DE L'INSCRIPTION :", err);
    res.status(500).json({ 
      error: "Erreur lors de la création du compte",
      details: err.message 
    });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.Users.findOne({
      where: { email },
      include: [
        {
          model: db.Groups,
          as: "group",
          include: [{ model: db.Permissions }],
        },
      ],
    });

    if (!user) return res.status(401).json({ error: "Identifiants invalides" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides" });

    const permissions = user.group?.Permissions?.map((p) => p.name) || [];

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        permissions: permissions,
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "8h" },
    );

    await db.Sessions.create({
      token: token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      scopes: ["access"],
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        permissions: permissions,
      },
    });
  } catch (err) {
    console.error("ERREUR DETECTEE LORS DU LOGIN :");
    console.error(err);
    res.status(500).json({
      error: "Erreur interne lors de la connexion",
      details: err.message,
    });
  }
};

// Mise à jour du profile (principalement pour le mot de passe)
exports.updateProfile = async (req, res) => {
  try {
    const { pseudo, password } = req.body;
    const user = await db.Users.findByPk(req.user.userId, {
      include: [{ model: db.Groups, as: "group" }],
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
        group: user.group?.name || "Guest",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Impossible de mettre à jour le profil" });
  }
};

// Récupération du profil
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

    const totalItemsInDb = await db.OrderItems.count();
    const itemsForThisOrder = await db.OrderItems.findAll({
      where: { orderId: 1 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.slice(7);

    await db.Sessions.destroy({ where: { token } });

    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la déconnexion" });
  }
};
