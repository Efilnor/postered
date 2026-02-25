module.exports = (sequelize, DataTypes) => {
  const Groups = sequelize.define('Groups', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, {
    tableName: 'groups',
    schema: 'public',
    timestamps: false
  });

  Groups.associate = (models) => {
    Groups.belongsToMany(models.Permissions, {
      through: models.GroupPermission,
      foreignKey: 'groupId',
      otherKey: 'permissionId',
      timestamps: false
    });
  };

  return Groups;
};
