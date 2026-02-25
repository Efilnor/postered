module.exports = (sequelize, DataTypes) => {
  const Designs = sequelize.define('Designs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    themeId: { type: DataTypes.INTEGER, allowNull: true },
    sizeId: { type: DataTypes.INTEGER, allowNull: false },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    status : { type: DataTypes.ENUM(['PENDING', 'APPROVED', 'REJECTED']), defaultValue: 'PENDING'}, 
    validatedAt: { type: DataTypes.DATE },
    validatorId: { type: DataTypes.INTEGER, allowNull: true }, 
    basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    salesCount: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'designs',
    timestamps: true
  });

  return Designs;
};
