// db/init.js
const db = require('../src/models');

async function ensureDbInitialized() {
  try {
    console.log("🚀 Connexion à la base de données...");
    
    // 1. On crée le schéma security
    await db.sequelize.query("CREATE SCHEMA IF NOT EXISTS security;");
    console.log('✅ Schéma "security" prêt.');

    // 2. Désactiver les contraintes de clés étrangères temporairement
    // Cela permet de créer les tables même si l'ordre n'est pas parfait
    await db.sequelize.query('SET CONSTRAINTS ALL DEFERRED');

    // 3. Synchroniser les tables dans l'ordre de dépendance
    // On synchronise d'abord les tables "parentes" (celles qui n'ont pas de FK)
    await db.Groups.sync({ alter: true });
    await db.Permissions.sync({ alter: true });
    await db.Sizes.sync({ alter: true });
    await db.Themes.sync({ alter: true });

    // Ensuite les tables qui dépendent des premières
    await db.Users.sync({ alter: true });
    await db.Sessions.sync({ alter: true });
    await db.GroupPermission.sync({ alter: true });

    // Et enfin le reste (Designs, Orders, etc.)
    await db.sequelize.sync({ alter: true });

    console.log("✅ Toutes les tables sont synchronisées dans le bon ordre.");

  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la DB :", error);
    throw error;
  }
}

module.exports = { ensureDbInitialized };