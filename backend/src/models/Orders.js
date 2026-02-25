module.exports = (sequelize, DataTypes) => {
  const Orders = sequelize.define('Orders', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    buyerId: { type: DataTypes.INTEGER, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
    status: { 
      type: DataTypes.ENUM('PAID', 'SHIPPED', 'CANCELLED'),
      defaultValue: 'PAID'
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'orders', schema: 'public', timestamps: false });
  return Orders;
};