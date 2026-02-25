module.exports = (sequelize, DataTypes) => {
  const GroupPermission = sequelize.define('GroupPermission', {
    groupId: { type: DataTypes.INTEGER, field: 'idGroup', references: { model: 'groups', key: 'id' } },
    permissionId: { type: DataTypes.INTEGER, field: 'idPermission', references: { model: 'permissions', key: 'id' } }
  }, { tableName: 'group_permissions', schema: 'public', timestamps: false });
  return GroupPermission;
};