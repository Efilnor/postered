module.exports = (sequelize, DataTypes) => {
  const Permissions = sequelize.define('Permissions', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, {
    tableName: 'permissions',
    timestamps: false
  });

  Permissions.associate = (models) => {
    Permissions.belongsToMany(models.Groups, {
      through: models.GroupPermission,
      foreignKey: 'permissionId',
      otherKey: 'groupId',
      timestamps: false
    });
  };

  return Permissions;
};
