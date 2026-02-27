// db/init.js
const db = require('../src/models');

async function ensureDbInitialized() {
  try {
    
    await db.sequelize.query("CREATE SCHEMA IF NOT EXISTS security;");

    await db.sequelize.query('SET CONSTRAINTS ALL DEFERRED');
   
    await db.Groups.sync({ alter: true });
    await db.Permissions.sync({ alter: true });
    await db.Sizes.sync({ alter: true });
    await db.Themes.sync({ alter: true });

    await db.Users.sync({ alter: true });
    await db.Sessions.sync({ alter: true });
    await db.GroupPermission.sync({ alter: true });

    await db.sequelize.sync({ alter: true });


  } catch (error) {
    console.error("Erreur lors de l'initialisation de la DB :", error);
    throw error;
  }
}

module.exports = { ensureDbInitialized };