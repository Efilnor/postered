const express = require('express'); // AJOUTÉ
const router = express.Router();    // AJOUTÉ
const path = require('path');
const db = require('../models');

router.get("/", async (req, res) => {
  try {
    const themes = await db.Themes.findAll();
    res.json(themes);
  } catch (err) {
    res.status(500).json({ error: "Impossible de charger les thèmes" });
  }
});

module.exports = router;