module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Sizes",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING },
      priceMultiplier: { type: DataTypes.FLOAT, defaultValue: 1.0 },
    },
    { tableName: "sizes", schema: "public", timestamps: false },
  );
};
