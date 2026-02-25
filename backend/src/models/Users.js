module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true,
      validate: { isEmail: true }
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    lastName: { 
      type: DataTypes.STRING,
      allowNull: true 
    },
    firstName: { 
      type: DataTypes.STRING,
      allowNull: true 
    },
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'groups', 
        key: 'id'
      }
    },
    createdAt: { 
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW 
    }
  }, {
    tableName: 'users',
    schema: 'public', 
    timestamps: false 
  });

  Users.associate = (models) => {
    Users.belongsTo(models.Groups, { foreignKey: 'groupId', as: 'group' });
  };

  return Users;
};