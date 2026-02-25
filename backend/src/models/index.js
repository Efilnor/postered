const { Sequelize, DataTypes } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postered_db';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const db = { sequelize, Sequelize, DataTypes };

// Import models
db.Users = require('./Users')(sequelize, DataTypes);
db.Groups = require('./Groups')(sequelize, DataTypes);
db.Designs = require('./Designs')(sequelize, DataTypes);
db.Permissions = require('./Permissions')(sequelize, DataTypes);
db.Sessions = require('./Sessions')(sequelize, DataTypes);
db.Orders = require('./Orders')(sequelize, DataTypes);
db.Sizes = require('./Sizes')(sequelize, DataTypes);
db.Themes = require('./Themes')(sequelize, DataTypes);
db.GroupPermission = require('./GroupPermission')(sequelize, DataTypes);
db.OrderItems = require('./OrderItem')(sequelize, DataTypes);

db.Groups.hasMany(db.Users, { foreignKey: 'groupId', as: 'members' });
db.Users.belongsTo(db.Groups, { foreignKey: 'groupId', as: 'group' });

// Un Utilisateur a plusieurs Sessions (si multi-appareils)
db.Users.hasMany(db.Sessions, { foreignKey: 'userId', as: 'sessions' });
db.Sessions.belongsTo(db.Users, { foreignKey: 'userId', as: 'user' });

// --- RELATIONS PERMISSIONS (Many-to-Many) ---

db.Groups.belongsToMany(db.Permissions, { 
  through: db.GroupPermission, 
  foreignKey: 'groupId', 
  otherKey: 'permissionId' 
});
db.Permissions.belongsToMany(db.Groups, { 
  through: db.GroupPermission, 
  foreignKey: 'permissionId', 
  otherKey: 'groupId' 
});

// --- RELATIONS DESIGNS ---

// Un Design est créé par un Designer (User) et validé par un Validator (User)
db.Users.hasMany(db.Designs, { foreignKey: 'designerId', as: 'createdDesigns' });
db.Designs.belongsTo(db.Users, { foreignKey: 'designerId', as: 'designer' });

db.Users.hasMany(db.Designs, { foreignKey: 'validatorId', as: 'validatedDesigns' });
db.Designs.belongsTo(db.Users, { foreignKey: 'validatorId', as: 'validator' });

// Designs <-> Sizes (Many-to-Many)
db.Designs.belongsToMany(db.Sizes, { through: 'designs_sizes', foreignKey: 'idDesign', otherKey: 'idSize' });
db.Sizes.belongsToMany(db.Designs, { through: 'designs_sizes', foreignKey: 'idSize', otherKey: 'idDesign' });

// Designs <-> Themes (Many-to-Many)
db.Themes.hasMany(db.Designs, { foreignKey: 'themeId', as: 'designs' });
db.Designs.belongsTo(db.Themes, { foreignKey: 'themeId', as: 'theme' });
// --- RELATIONS COMMANDES ---

// Un Utilisateur (Buyer) a plusieurs Commandes
db.Users.hasMany(db.Orders, { foreignKey: 'buyerId', as: 'orders' });
db.Orders.belongsTo(db.Users, { foreignKey: 'buyerId', as: 'buyer' });

// Une Commande a plusieurs Items
db.Orders.hasMany(db.OrderItems, { foreignKey: 'orderId', as: 'items' });
db.OrderItems.belongsTo(db.Orders, { foreignKey: 'orderId', as: 'order' });

// Un Item de commande pointe vers un Design et une Taille spécifique
db.OrderItems.belongsTo(db.Designs, { foreignKey: 'designId' });
db.OrderItems.belongsTo(db.Sizes, { foreignKey: 'sizeId' });
module.exports = db;
