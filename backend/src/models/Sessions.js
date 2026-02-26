module.exports = (sequelize, DataTypes) => {
  const Sessions = sequelize.define('Sessions', {
    token: { 
      type: DataTypes.TEXT, 
      primaryKey: true 
    },
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'user_id',
      references: {
        model: {
          tableName: 'users',
          schema: 'public'
        },
        key: 'id'
      }
    },
    expiresAt: { 
      type: DataTypes.DATE,
      field: 'expires_at'
    },
    scopes: { 
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: []
    }
  }, {
    tableName: 'sessions',
    schema: 'security',
    timestamps: false
  });

  Sessions.associate = (models) => {
    Sessions.belongsTo(models.Users, { foreignKey: 'userId', as: 'user' });
  };

  return Sessions;
};