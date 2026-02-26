const db = require("../models");

// Récupérer les designs du créateur connecté
exports.getMyDesigns = async (req, res) => {
  console.log("Fetching designs for User ID:", req.user.userId); // 👈 LOG DE DEBUG
  try {
    const designs = await db.Designs.findAll({
      where: { designerId: req.user.userId },
      include: [{ model: db.Themes, as: 'theme', attributes: ['name'] }]
    });
    res.json(designs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer tous les designs en attente
exports.getPendingDesigns = async (req, res) => {
  try {
    const designs = await db.Designs.findAll({
      where: { status: 'PENDING' },
      include: [
        { model: db.Themes, as: 'theme', attributes: ['name'] },
        { model: db.Users, as: 'designer', attributes: ['firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.json(designs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Créer un nouveau design
exports.createDesign = async (req, res) => {
  try {
    const { title, description, themeId, sizeId, basePrice } = req.body;
    if (!req.file) return res.status(400).json({ error: "Fichier image manquant" });

    const imageUrl = `/uploads/designs/${req.file.filename}`;
    const newDesign = await db.Designs.create({
      title,
      description,
      themeId: themeId || 1,
      sizeId: sizeId || 1,
      basePrice,
      imageUrl,
      designerId: req.user.userId,
      status: "PENDING",
    });
    res.json(newDesign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer tous les designs validés (Public)
exports.getAllApproved = async (req, res) => {
  try {
    const designs = await db.Designs.findAll({
      where: { status: "APPROVED" },
      include: [
        { 
          model: db.Themes, 
          as: 'theme',
          attributes: ['name'] 
        }
      ]
    });
    res.json(designs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Valider ou Refuser un design
exports.verifyDesign = async (req, res) => {
  try {
    const { status } = req.body;
    const design = await db.Designs.findByPk(req.params.id);
    if (!design) return res.status(404).json({ error: "Design non trouvé" });

    design.status = status;
    design.validatorId = req.user.userId;
    design.validatedAt = new Date();
    await design.save();

    res.json({ message: `Design ${status.toLowerCase()} avec succès`, design });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un design par ID
exports.getDesignById = async (req, res) => {
  try {
    const design = await db.Designs.findByPk(req.params.id, {
      include: [
        { 
          model: db.Themes, 
          as: 'theme', 
          attributes: ['name'] 
        },
        {
          model: db.Users,
          as: 'designer',
          attributes: ['firstName', 'lastName']
        }
      ]
    });
    if (!design) return res.status(404).json({ error: "Design non trouvé" });
    res.json(design);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};